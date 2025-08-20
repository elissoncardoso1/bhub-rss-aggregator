import { Navigation } from "@/src/components/Navigation"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="journal-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="journal-logo text-xl mb-4">bhub</h3>
              <p className="journal-body text-sm">
                Agregador de artigos científicos em Análise do Comportamento Aplicada. 
                Mantenha-se atualizado com as últimas pesquisas da área.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-eb-garamond">
                Navegação
              </h4>
              <ul className="space-y-2 text-sm journal-body">
                <li>
                  <a href="/" className="text-gray-600 hover:text-red-600 transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <a href="/repository" className="text-gray-600 hover:text-red-600 transition-colors">
                    Repositório
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-600 hover:text-red-600 transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-red-600 transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 font-eb-garamond">
                Recursos
              </h4>
              <ul className="space-y-2 text-sm journal-body">
                <li>Feeds RSS/Atom</li>
                <li>Busca avançada</li>
                <li>Categorização automática</li>
                <li>Análise do Comportamento</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-sm text-gray-600 journal-body">
              © 2024 bhub. Desenvolvido para a comunidade de Análise do Comportamento.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
