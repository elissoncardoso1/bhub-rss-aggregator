import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminStats() {
  try {
    console.log('🔍 Verificando estatísticas do banco de dados...');
    
    // Total de artigos
    const totalArticles = await prisma.article.count();
    console.log(`📄 Total de artigos: ${totalArticles}`);
    
    // Total de feeds
    const totalFeeds = await prisma.feed.count();
    console.log(`📡 Total de feeds: ${totalFeeds}`);
    
    // Feeds ativos
    const activeFeeds = await prisma.feed.count({
      where: { isActive: true }
    });
    console.log(`✅ Feeds ativos: ${activeFeeds}`);
    
    // Total de autores
    const totalAuthors = await prisma.author.count();
    console.log(`👥 Total de autores: ${totalAuthors}`);
    
    // Artigos das últimas 24 horas
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const articlesLast24h = await prisma.article.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });
    console.log(`🕒 Artigos das últimas 24h: ${articlesLast24h}`);
    
    // Artigos por país (removido devido a limitação do groupBy)
    
    // Contar feeds por país
    const feedsByCountry = await prisma.feed.groupBy({
      by: ['country'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });
    
    console.log('\n🌍 Feeds por país:');
    feedsByCountry.forEach(item => {
      console.log(`   ${item.country || 'Não especificado'}: ${item._count.id} feeds`);
    });
    
    // Últimas sincronizações
    const recentSyncs = await prisma.feed.findMany({
      where: {
        lastSyncAt: {
          not: null
        }
      },
      orderBy: {
        lastSyncAt: 'desc'
      },
      take: 5,
      select: {
        name: true,
        lastSyncAt: true
      }
    });
    
    console.log('\n🔄 Últimas sincronizações:');
    recentSyncs.forEach(feed => {
      console.log(`   ${feed.name}: ${feed.lastSyncAt?.toLocaleString('pt-BR')}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estatísticas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminStats();