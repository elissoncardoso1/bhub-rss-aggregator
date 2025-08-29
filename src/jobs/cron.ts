import cron from "node-cron"
import { syncAllFeeds } from "./syncFeeds"
// import { cleanRepository } from "./cleanRepository" // DESABILITADO - Sistema de consulta

/**
 * Configuração dos jobs de cron
 * IMPORTANTE: Use apenas em ambientes com servidor persistente (não serverless)
 * 
 * NOTA: Sistema configurado como REPOSITÓRIO DE CONSULTA
 * - Artigos antigos são mantidos para consulta histórica
 * - Não há limpeza automática de conteúdo
 * - Foco em preservar o acervo científico
 */

let cronJobsStarted = false

export function startCronJobs() {
  if (cronJobsStarted) {
    console.log("⚠️ Cron jobs já foram iniciados")
    return
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Ambiente de desenvolvimento - cron jobs desabilitados")
    return
  }
  
  console.log("⏰ Iniciando cron jobs...")
  
  // Sincronização a cada hora
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Executando sincronização automática...")
    try {
      await syncAllFeeds()
    } catch (error) {
      console.error("❌ Erro na sincronização automática:", error)
    }
  }, {
    name: "sync-feeds",
    timezone: "America/Sao_Paulo"
  })
  
  // LIMPEZA AUTOMÁTICA DESABILITADA - Sistema de consulta
  // cron.schedule("0 2 * * 0", async () => {
  //   console.log("⏰ Executando limpeza automática...")
  //   try {
  //     await cleanRepository(365) // Remove artigos com mais de 365 dias
  //   } catch (error) {
  //     console.error("❌ Erro na limpeza automática:", error)
  //   }
  // }, {
  //   name: "clean-repository",
  //   timezone: "America/Sao_Paulo"
  // })
  
  cronJobsStarted = true
  console.log("✅ Cron jobs iniciados com sucesso")
  console.log("  - Sincronização: a cada hora")
  console.log("  - Limpeza: DESABILITADA (Sistema de consulta)")
  console.log("  - Artigos antigos são preservados para consulta histórica")
}

export function stopCronJobs() {
  cron.getTasks().forEach(task => {
    console.log(`🛑 Parando cron job`)
    task.stop()
  })
  cronJobsStarted = false
  console.log("✅ Cron jobs parados")
}

// Exporta apenas a sincronização (limpeza desabilitada)
export { syncAllFeeds }
