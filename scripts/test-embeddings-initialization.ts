#!/usr/bin/env tsx

import { initializeEmbeddings, isEmbeddingSystemReady, embeddingManager } from '../src/lib/ml'

/**
 * Script para testar a inicialização do sistema de embeddings
 */
async function testEmbeddingsInitialization() {
  console.log('🧪 Testando inicialização do sistema de embeddings...\n')

  try {
    // 1. Verifica status inicial
    console.log('1️⃣ Verificando status inicial...')
    console.log(`   Sistema pronto: ${isEmbeddingSystemReady()}`)
    console.log(`   Informações do modelo:`, embeddingManager.getModelInfo())
    console.log()

    // 2. Inicializa o sistema
    console.log('2️⃣ Inicializando sistema de embeddings...')
    const startTime = Date.now()
    await initializeEmbeddings()
    const endTime = Date.now()
    console.log(`✅ Sistema inicializado em ${endTime - startTime}ms`)
    console.log()

    // 3. Verifica status após inicialização
    console.log('3️⃣ Verificando status após inicialização...')
    console.log(`   Sistema pronto: ${isEmbeddingSystemReady()}`)
    console.log(`   Informações do modelo:`, embeddingManager.getModelInfo())
    console.log()

    // 4. Testa geração de embedding
    console.log('4️⃣ Testando geração de embedding...')
    const testText = 'Terapia comportamental cognitiva para ansiedade'
    const embedding = await embeddingManager.generateEmbedding(testText)
    console.log(`   Texto: "${testText}"`)
    console.log(`   Dimensões do embedding: ${embedding.values.length}`)
    console.log(`   Magnitude: ${embedding.magnitude.toFixed(4)}`)
    console.log(`   Primeiros 5 valores: [${embedding.values.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`)
    console.log()

    // 5. Testa obtenção de embeddings das categorias
    console.log('5️⃣ Testando embeddings das categorias...')
    const categoryEmbeddings = embeddingManager.getCategoryEmbeddings()
    console.log(`   Categorias disponíveis: ${categoryEmbeddings.length}`)
    categoryEmbeddings.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug}): ${cat.examples.length} exemplos`)
    })
    console.log()

    console.log('🎉 Teste concluído com sucesso!')
    console.log('✅ Sistema de embeddings está funcionando corretamente!')

  } catch (error) {
    console.error('💥 Erro durante o teste:', error)
    process.exit(1)
  }
}

// Executa o teste
testEmbeddingsInitialization()