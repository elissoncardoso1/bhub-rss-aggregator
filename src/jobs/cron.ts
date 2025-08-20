import cron from "node-cron"
import { syncAllFeeds } from "./syncFeeds"
import { cleanRepository } from "./cleanRepository"

/**
 * Configuração dos jobs de cron
 * IMPORTANTE: Use apenas em ambientes com servidor persistente (não serverless)
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
  
  // Limpeza semanal (domingo às 02:00)
  cron.schedule("0 2 * * 0", async () => {
    console.log("⏰ Executando limpeza automática...")
    try {
      await cleanRepository(365) // Remove artigos com mais de 365 dias
    } catch (error) {
      console.error("❌ Erro na limpeza automática:", error)
    }
  }, {
    name: "clean-repository",
    timezone: "America/Sao_Paulo"
  })
  
  cronJobsStarted = true
  console.log("✅ Cron jobs iniciados com sucesso")
  console.log("  - Sincronização: a cada hora")
  console.log("  - Limpeza: domingos às 02:00")
}

export function stopCronJobs() {
  cron.getTasks().forEach((task, name) => {
    task.stop()
    console.log(`⏹️ Parando job: ${name}`)
  })
  cronJobsStarted = false
  console.log("🛑 Todos os cron jobs foram parados")
}

// Para ambientes serverless, exporte as funções individuais
export { syncAllFeeds, cleanRepository }
