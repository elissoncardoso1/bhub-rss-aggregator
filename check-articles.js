const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkArticles() {
  try {
    console.log('🔍 Verificando artigos no banco de dados...');
    
    const totalArticles = await prisma.article.count();
    console.log('📊 Total de artigos:', totalArticles);
    
    if (totalArticles > 0) {
      const recentArticles = await prisma.article.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          feed: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log('\n📰 Artigos recentes:');
      recentArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`   📡 Feed: ${article.feed?.name || 'Sem feed'}`);
        console.log(`   📅 Data: ${article.createdAt}\n`);
      });
    } else {
      console.log('⚠️  Nenhum artigo encontrado no banco de dados.');
      console.log('💡 Isso explica por que as imagens não estão carregando.');
      console.log('🔧 Você precisa executar o processo de importação de feeds primeiro.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();