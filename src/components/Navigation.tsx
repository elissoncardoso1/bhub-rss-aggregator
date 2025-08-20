"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { 
  Home, 
  BookOpen, 
  Info, 
  Mail, 
  Settings, 
  LogOut,
  User,
  Menu,
  X,
  Search
} from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // @ts-ignore - session tem a propriedade role adicionada no callback
  const isAdmin = session?.user?.role === "ADMIN"

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Repositório", href: "/repository" },
    { name: "Sobre", href: "/about" },
    { name: "Contato", href: "/contact" },
  ]

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <header className="journal-header sticky top-0 z-50">
      {/* Barra superior com data e informações */}
      <div className="bg-gray-100 border-b border-gray-300 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span>{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <div className="h-4 w-16 bg-gray-300 animate-pulse" />
              ) : session ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline">
                    Olá, {session.user?.name || session.user?.email}
                  </span>
                  {isAdmin && (
                    <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-red-600"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" className="text-red-600 hover:text-red-700 font-medium">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="journal-logo">
                bhub
              </Link>
              <p className="text-xs text-gray-600 mt-1 font-sans">
                Agregador de Análise do Comportamento
              </p>
            </div>

            {/* Menu desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="journal-nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Busca e menu mobile */}
            <div className="flex items-center space-x-4">
              <Link href="/repository" className="text-gray-600 hover:text-red-600">
                <Search className="h-5 w-5" />
              </Link>
              
              {/* Botão menu mobile */}
              <button
                type="button"
                className="md:hidden p-2 text-gray-600 hover:text-red-600"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {session && isAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Administração
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
