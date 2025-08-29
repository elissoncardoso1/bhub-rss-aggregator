#!/usr/bin/env tsx

import { initializeEmbeddings, embeddingClassifier, classifyArticle } from '../src/lib/ml'

/**
 * Script para testar detalhadamente o sistema de classificação
 */
async function testDetailedClassification() {
  console.log('🧪 Teste Detalhado do Sistema de Classificação\n')

  try {
    // 1. Inicializa o sistema
    console.log('1️⃣ Inicializando sistema de embeddings...')
    await initializeEmbeddings()
    console.log('✅ Sistema inicializado com sucesso!\n')

    // 2. Testes específicos de Análise do Comportamento
    console.log('2️⃣ Testando classificação de artigos de Análise do Comportamento...\n')

    const testArticles = [
      {
        title: 'Análise Experimental do Comportamento (EAB)',
        abstract: 'Investigação sobre os princípios fundamentais da análise experimental do comportamento, incluindo reforçamento, punição e extinção em contextos laboratoriais controlados.',
        keywords: ['EAB', 'experimental', 'reforçamento', 'punição', 'extinção'],
        expectedCategory: 'Pesquisa'
      },
      {
        title: 'Terapia ABA para Crianças com TEA',
        abstract: 'Aplicação da Análise do Comportamento Aplicada (ABA) no tratamento de crianças com Transtorno do Espectro Autista, focando no desenvolvimento de habilidades sociais e comunicativas.',
        keywords: ['ABA', 'TEA', 'autismo', 'terapia', 'habilidades sociais'],
        expectedCategory: 'Clínica'
      },
      {
        title: 'Programas de Educação Especial Baseados em ABA',
        abstract: 'Desenvolvimento e implementação de programas educacionais para crianças com necessidades especiais, utilizando princípios da análise do comportamento aplicada.',
        keywords: ['educação especial', 'ABA', 'programas educacionais', 'necessidades especiais'],
        expectedCategory: 'Educação'
      },
      {
        title: 'Gestão de Comportamento em Organizações',
        abstract: 'Aplicação dos princípios da análise do comportamento organizacional para melhorar a produtividade e o clima organizacional em empresas.',
        keywords: ['comportamento organizacional', 'gestão', 'produtividade', 'clima organizacional'],
        expectedCategory: 'Organizacional'
      },
      {
        title: 'Metodologia de Pesquisa em Análise do Comportamento',
        abstract: 'Revisão sistemática dos métodos de pesquisa utilizados em estudos de análise do comportamento, incluindo design de experimentos e análise de dados.',
        keywords: ['metodologia', 'pesquisa', 'análise do comportamento', 'design experimental'],
        expectedCategory: 'Pesquisa'
      },
      {
        title: 'Intervenções Comportamentais em Saúde Mental',
        abstract: 'Aplicação de técnicas comportamentais no tratamento de transtornos de saúde mental, incluindo ansiedade, depressão e transtornos de personalidade.',
        keywords: ['intervenções comportamentais', 'saúde mental', 'transtornos', 'tratamento'],
        expectedCategory: 'Clínica'
      },
      {
        title: 'Análise do Comportamento em Contextos Educacionais',
        abstract: 'Implementação de estratégias baseadas em análise do comportamento para melhorar o desempenho acadêmico e comportamental de estudantes.',
        keywords: ['análise do comportamento', 'educação', 'desempenho acadêmico', 'estudantes'],
        expectedCategory: 'Educação'
      },
      {
        title: 'Sistemas de Reforçamento em Empresas',
        abstract: 'Análise e implementação de sistemas de reforçamento para aumentar a motivação e produtividade dos funcionários em ambientes corporativos.',
        keywords: ['sistemas de reforçamento', 'motivação', 'produtividade', 'funcionários'],
        expectedCategory: 'Organizacional'
      }
    ]

    let correctClassifications = 0
    let totalClassifications = 0

    for (let i = 0; i < testArticles.length; i++) {
      const article = testArticles[i]
      console.log(`📄 Teste ${i + 1}: ${article.title}`)
      console.log(`   📝 Resumo: ${article.abstract.substring(0, 80)}...`)
      console.log(`   🎯 Categoria Esperada: ${article.expectedCategory}`)
      
      try {
        const classification = await classifyArticle(
          article.title,
          article.abstract,
          article.keywords
        )

        if (classification) {
          console.log(`   🏷️  Categoria Classificada: ${classification.category}`)
          console.log(`   📊 Confiança: ${(classification.confidence * 100).toFixed(1)}%`)
          
          // Verifica se a classificação está correta
          const isCorrect = classification.category === article.expectedCategory
          if (isCorrect) {
            console.log(`   ✅ CORRETO!`)
            correctClassifications++
          } else {
            console.log(`   ❌ INCORRETO - Esperado: ${article.expectedCategory}`)
          }
          
          totalClassifications++

          if (classification.alternativeCategories && classification.alternativeCategories.length > 0) {
            console.log(`   🔄 Alternativas:`)
            classification.alternativeCategories.forEach(alt => {
              console.log(`      - ${alt.category}: ${(alt.confidence * 100).toFixed(1)}%`)
            })
          }
        } else {
          console.log(`   ❌ Sem categoria específica`)
        }
        
        console.log('')

      } catch (error) {
        console.log(`   💥 Erro: ${error instanceof Error ? error.message : String(error)}\n`)
      }
    }

    // 3. Estatísticas do teste
    console.log('3️⃣ Estatísticas do Teste:')
    console.log(`   📊 Total de Testes: ${totalClassifications}`)
    console.log(`   ✅ Classificações Corretas: ${correctClassifications}`)
    console.log(`   ❌ Classificações Incorretas: ${totalClassifications - correctClassifications}`)
    console.log(`   🎯 Taxa de Acerto: ${totalClassifications > 0 ? ((correctClassifications / totalClassifications) * 100).toFixed(1) : 0}%`)

    // 4. Informações do sistema
    console.log('\n4️⃣ Informações do Sistema:')
    const systemInfo = embeddingClassifier.getSystemInfo()
    console.log(`   🤖 Sistema pronto: ${systemInfo.isReady ? 'Sim' : 'Não'}`)
    console.log(`   📊 Threshold de fallback: ${systemInfo.fallbackThreshold}`)
    console.log(`   🧠 Modelo: ${systemInfo.embeddingInfo.name}`)
    console.log(`   📚 Categorias: ${systemInfo.embeddingInfo.categoriesCount}`)

    console.log('\n🎉 Teste detalhado concluído!')

  } catch (error) {
    console.error('💥 Erro durante o teste:', error)
    process.exit(1)
  }
}

// Executa o teste
testDetailedClassification()
