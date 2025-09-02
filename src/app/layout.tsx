import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "@/src/components/SessionProvider"
import { QueryProvider } from "@/src/components/QueryProvider"
import { ToastProvider } from "@/src/components/ToastProvider"
import "@/src/styles/globals.css"

// Inicializa sistemas críticos da aplicação
import "@/src/lib/startup"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "bhub - Repositório de Consulta em Análise do Comportamento",
  description: "Repositório moderno de artigos científicos em Análise do Comportamento Aplicada, desenvolvido para preservação, busca e consulta de conteúdo científico histórico",
  keywords: ["análise do comportamento", "psicologia", "artigos científicos", "repositório", "preservação", "consulta científica", "pesquisa acadêmica"],
  authors: [{ name: "bhub Team" }],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            {children}
            <ToastProvider />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
