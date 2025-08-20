import { syncAllFeeds } from "../src/jobs/syncFeeds"

async function main() {
  console.log('🚀 Executando sincronização de feeds...')
  
  try {
    const result = await syncAllFeeds()
    console.log('✅ Sincronização concluída com sucesso!')
    console.log('📊 Resultado:', result)
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    process.exit(1)
  }
}

main()
