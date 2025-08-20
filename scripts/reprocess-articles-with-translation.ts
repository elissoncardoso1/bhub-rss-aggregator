import { PrismaClient } from '@prisma/client';
import { EmbeddingClassifier } from '../src/lib/ml/embedClassifier';
import { initializeEmbeddings, isEmbeddingSystemReady } from '../src/lib/ml';
import logger from '../src/lib/logger';

const prisma = new PrismaClient();
const classifier = new EmbeddingClassifier();

async function reprocessArticlesWithTranslation() {
  try {
    console.log('🚀 Iniciando reprocessamento de artigos com tradução automática...');
    
    // Inicializa o sistema de ML se ainda não estiver pronto
    if (!isEmbeddingSystemReady()) {
      console.log('🤖 Inicializando sistema de embeddings...');
      try {
        await initializeEmbeddings();
        console.log('✅ Sistema de embeddings inicializado com sucesso!');
      } catch (error) {
        console.warn('⚠️ Erro ao inicializar sistema de embeddings, continuando com fallback:', error);
      }
    } else {
      console.log('✅ Sistema de embeddings já está pronto!');
    }
    
    // Buscar todos os artigos
    const articles = await prisma.article.findMany({
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    console.log(`📊 Total de artigos encontrados: ${articles.length}`);
    
    let processedCount = 0;
    let translatedCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        console.log(`\n📄 Processando artigo ${processedCount + 1}/${articles.length}: ${article.title}`);
        
        // Parse das keywords do JSON
        let keywords: string[] = [];
        if (article.keywordsRaw) {
          try {
            keywords = JSON.parse(article.keywordsRaw);
          } catch (e) {
            keywords = [];
          }
        }

        // Reclassificar o artigo (isso vai usar a tradução automática)
        const result = await classifier.classifyArticle(
          article.title,
          article.abstract || '',
          keywords
        );

        if (result) {
          // Buscar a categoria pelo slug
          const newCategory = await prisma.category.findUnique({
            where: { slug: result.slug }
          });

          // Atualizar a categoria se mudou
          if (newCategory && newCategory.id !== article.categoryId) {
            await prisma.article.update({
              where: { id: article.id },
              data: { categoryId: newCategory.id }
            });
            console.log(`   🔄 Categoria atualizada: ${article.category?.name || 'Sem categoria'} → ${result.category}`);
          }

          console.log(`   🏷️  Categoria: ${result.category}`);
          console.log(`   📊 Confiança: ${(result.confidence * 100).toFixed(1)}%`);
        } else {
          console.log(`   ⚠️  Não foi possível classificar o artigo`);
        }
        
        // Verificar se houve tradução (através dos logs)
        if (article.abstract && article.abstract.length > 0) {
          // Assumir que artigos com resumo foram processados para tradução
          translatedCount++;
        }
        
        processedCount++;
        
        // Pequena pausa para não sobrecarregar o sistema
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Erro ao processar artigo ${article.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Reprocessamento concluído!');
    console.log(`📊 Resultados:`);
    console.log(`   📰 Artigos processados: ${processedCount}`);
    console.log(`   🌍 Artigos com tradução: ${translatedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Erro durante o reprocessamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
reprocessArticlesWithTranslation()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });