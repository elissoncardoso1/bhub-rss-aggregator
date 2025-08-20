import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o banco...')
    
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados')
    
    // Testar uma query simples
    const feedCount = await prisma.feed.count()
    console.log(`📊 Total de feeds no banco: ${feedCount}`)
    
    const articleCount = await prisma.article.count()
    console.log(`📄 Total de artigos no banco: ${articleCount}`)
    
    const categoryCount = await prisma.category.count()
    console.log(`📂 Total de categorias no banco: ${categoryCount}`)
    
    console.log('🎉 Conexão funcionando perfeitamente!')
    
  } catch (error: any) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
