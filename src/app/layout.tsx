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
  title: "bhub - Agregador RSS de Análise do Comportamento",
  description: "Agregador de artigos científicos em Análise do Comportamento Aplicada via RSS/Atom",
  keywords: ["análise do comportamento", "psicologia", "artigos científicos", "RSS", "agregador"],
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
