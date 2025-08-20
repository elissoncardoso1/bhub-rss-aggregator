#!/usr/bin/env tsx

import { initializeEmbeddings, embeddingClassifier, classifyArticle } from '../src/lib/ml'

/**
 * Script para testar o sistema de ML
 */
async function testMLSystem() {
  console.log('🧪 Testando sistema de ML...\n')

  try {
    // 1. Inicializa o sistema
    console.log('1️⃣ Inicializando sistema de embeddings...')
    await initializeEmbeddings()
    console.log('✅ Sistema inicializado com sucesso!\n')

    // 2. Testa classificação de artigos
    console.log('2️⃣ Testando classificação de artigos...\n')

    const testArticles = [
      {
        title: 'Terapia Comportamental Cognitiva para Ansiedade',
        abstract: 'Estudo sobre a eficácia da TCC no tratamento de transtornos de ansiedade em adultos',
        keywords: ['terapia cognitiva', 'ansiedade', 'tratamento', 'psicologia clínica']
      },
      {
        title: 'Métodos de Ensino para Crianças com Autismo',
        abstract: 'Análise de estratégias pedagógicas para melhorar o aprendizado de crianças autistas',
        keywords: ['educação especial', 'autismo', 'ensino', 'pedagogia']
      },
      {
        title: 'Liderança e Desempenho Organizacional',
        abstract: 'Investigação sobre o impacto de diferentes estilos de liderança no sucesso empresarial',
        keywords: ['liderança', 'organização', 'desempenho', 'gestão']
      },
      {
        title: 'Metodologia de Pesquisa em Psicologia Experimental',
        abstract: 'Revisão sistemática de métodos experimentais utilizados em estudos comportamentais',
        keywords: ['metodologia', 'pesquisa', 'experimental', 'psicologia']
      },
      {
        title: 'Análise do Comportamento em Primatas',
        abstract: 'Estudo comparativo do comportamento de primatas em diferentes contextos ambientais',
        keywords: ['comportamento animal', 'primatas', 'análise comportamental', 'etologia']
      }
    ]

    for (let i = 0; i < testArticles.length; i++) {
      const article = testArticles[i]
      console.log(`📄 Artigo ${i + 1}: ${article.title}`)
      
      const classification = await classifyArticle(
        article.title,
        article.abstract,
        article.keywords
      )

      if (classification) {
        console.log(`   🏷️  Categoria: ${classification.category}`)
        console.log(`   📊 Confiança: ${(classification.confidence * 100).toFixed(1)}%`)
        
        if (classification.alternativeCategories.length > 0) {
          console.log(`   🔄 Alternativas:`)
          classification.alternativeCategories.forEach(alt => {
            console.log(`      - ${alt.category}: ${(alt.confidence * 100).toFixed(1)}%`)
          })
        }
      } else {
        console.log(`   ❌ Sem categoria específica`)
      }
      console.log('')
    }

    // 3. Informações do sistema
    console.log('3️⃣ Informações do sistema:')
    const systemInfo = embeddingClassifier.getSystemInfo()
    console.log(`   🤖 Sistema pronto: ${systemInfo.isReady ? 'Sim' : 'Não'}`)
    console.log(`   📊 Threshold de fallback: ${systemInfo.fallbackThreshold}`)
    console.log(`   🧠 Modelo: ${systemInfo.embeddingInfo.name}`)
    console.log(`   📚 Categorias: ${systemInfo.embeddingInfo.categoriesCount}`)

    console.log('\n🎉 Teste concluído com sucesso!')

  } catch (error) {
    console.error('💥 Erro durante o teste:', error)
    process.exit(1)
  }
}

// Executa o teste
testMLSystem()
