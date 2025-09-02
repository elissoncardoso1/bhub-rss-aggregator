import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { 
  Mail, 
  MessageSquare, 
  Github, 
  ExternalLink,
  Lightbulb,
  Bug,
  Plus,
  HelpCircle
} from "lucide-react"

export default function ContactPage() {
  const contactTypes = [
    {
      icon: Plus,
      title: "Sugerir Novo Feed",
      description: "Conhece um periódico que deveria estar no bhub?",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: Bug,
      title: "Reportar Problema",
      description: "Encontrou um bug ou erro no sistema?",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      icon: Lightbulb,
      title: "Sugerir Melhoria",
      description: "Tem uma ideia para melhorar a plataforma?",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      icon: HelpCircle,
      title: "Dúvidas Gerais",
      description: "Precisa de ajuda ou tem alguma pergunta?",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            O bhub é um projeto da comunidade, para a comunidade. Entre em contato conosco 
            para sugestões, dúvidas, contribuições ou para fazer parte da construção da maior 
            plataforma de preservação de conteúdo científico em Análise do Comportamento.
          </p>
        </div>

        {/* Tipos de contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactTypes.map((type, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-lg ${type.bgColor}`}>
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                  </div>
                  {type.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Envie uma Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <select
                    id="subject"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    <option value="">Selecione o assunto</option>
                    <option value="feed">Sugerir novo feed</option>
                    <option value="bug">Reportar problema</option>
                    <option value="feature">Sugerir melhoria</option>
                    <option value="question">Dúvida geral</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Descreva sua solicitação, sugestão ou dúvida..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>

                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  * Campos obrigatórios. Responderemos em até 48 horas.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <div className="space-y-6">
            {/* Contato direto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contato Direto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    E-mail
                  </h4>
                  <a
                    href="mailto:contato@bhub.online"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                  >
                    contato@bhub.online
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Tempo de Resposta
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Respondemos em até 48 horas úteis. Para questões urgentes, 
                    utilize o GitHub Issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GitHub */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Desenvolvimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Repositório
                  </h4>
                  <a
                    href="https://github.com/elissoncardoso1/bhub-rss-aggregator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                  >
                    github.com/elissoncardoso1/bhub-rss-aggregator
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Contribuições
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Contribua com o projeto através de Pull Requests, Issues ou 
                    sugestões de melhorias.
                  </p>
                  <a
                    href="https://github.com/elissoncardoso1/bhub-rss-aggregator/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      Abrir Issue
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* FAQ rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Como sugerir um novo feed?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Envie o URL do feed RSS/Atom e informações sobre o periódico 
                    através do formulário ou e-mail.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    O bhub é gratuito?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sim! O bhub é completamente gratuito e open source.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Como posso contribuir?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Através de código, sugestões de feeds, relatórios de bugs 
                    ou divulgação do projeto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Junte-se à Comunidade bhub
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Faça parte da construção da maior plataforma de preservação de conteúdo 
                científico em Análise do Comportamento do Brasil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://github.com/elissoncardoso1/bhub-rss-aggregator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <Github className="h-4 w-4 mr-2" />
                    Ver no GitHub
                  </Button>
                </a>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Entrar em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
