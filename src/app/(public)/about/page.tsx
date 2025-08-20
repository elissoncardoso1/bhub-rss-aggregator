import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { 
  Target, 
  Rss, 
  Database, 
  Search, 
  Users, 
  BookOpen,
  Zap,
  Shield,
  Heart
} from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Rss,
      title: "Agregação RSS/Atom",
      description: "Coletamos automaticamente artigos de múltiplos periódicos científicos através de feeds RSS e Atom, mantendo o conteúdo sempre atualizado."
    },
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Sistema de busca avançado que permite encontrar artigos por título, autor, palavras-chave e categorias específicas."
    },
    {
      icon: Database,
      title: "Categorização Automática",
      description: "Artigos são automaticamente categorizados em áreas como Clínica, Educação, Experimental e Organizacional."
    },
    {
      icon: Users,
      title: "Índice de Autores",
      description: "Acompanhe trabalhos de pesquisadores específicos e descubra colaborações na área."
    }
  ]

  const stats = [
    { label: "Áreas de Foco", value: "5+", description: "Diferentes especialidades da ABA" },
    { label: "Atualização", value: "1h", description: "Frequência de sincronização" },
    { label: "Idiomas", value: "PT/EN", description: "Suporte multilíngue" },
    { label: "Open Source", value: "100%", description: "Código aberto" }
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="text-4xl font-bold text-gradient">bhub</div>
            <Badge variant="outline" className="text-xs">v1.0</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre o Projeto
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            O <strong>bhub</strong> é um agregador RSS especializado em artigos científicos de 
            Análise do Comportamento Aplicada (ABA), desenvolvido para centralizar e facilitar 
            o acesso ao conhecimento produzido na área.
          </p>
        </div>

        {/* Missão */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-blue-600" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Democratizar o acesso à produção científica em Análise do Comportamento, 
              fornecendo uma plataforma centralizada onde pesquisadores, estudantes e 
              profissionais possam descobrir, explorar e acompanhar as últimas pesquisas da área.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Acreditamos que a ciência deve ser acessível e que a tecnologia pode ser uma 
              ferramenta poderosa para conectar conhecimento e pessoas, promovendo o avanço 
              da Análise do Comportamento no Brasil e no mundo.
            </p>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Como Funciona
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Características Técnicas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Áreas de Cobertura */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-green-600" />
              Áreas de Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              O bhub categoriza automaticamente os artigos nas seguintes áreas principais:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Terapia Comportamental", color: "#3B82F6" },
                { name: "Análise Experimental", color: "#10B981" },
                { name: "Educação", color: "#F59E0B" },
                { name: "Clínica", color: "#EF4444" },
                { name: "Organizacional", color: "#8B5CF6" }
              ].map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="justify-center py-2 px-4"
                  style={{ borderColor: area.color, color: area.color }}
                >
                  {area.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tecnologia */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-6 w-6 text-yellow-600" />
              Tecnologia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Desenvolvido com tecnologias modernas para garantir performance, 
              escalabilidade e uma experiência de usuário excepcional:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Next.js 14",
                "TypeScript", 
                "PostgreSQL",
                "Prisma ORM",
                "TailwindCSS",
                "NextAuth",
                "RSS Parser",
                "Node Cron"
              ].map((tech, index) => (
                <Badge key={index} variant="secondary" className="justify-center">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-6 w-6 text-purple-600" />
              Privacidade e Ética
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Respeito aos Direitos Autorais:</strong> O bhub não armazena o conteúdo 
                completo dos artigos, apenas metadados e resumos obtidos via feeds RSS públicos. 
                Todos os links direcionam para as fontes originais.
              </p>
              <p>
                <strong>Privacidade:</strong> Coletamos apenas dados essenciais para o funcionamento 
                da plataforma. Não vendemos, compartilhamos ou utilizamos dados pessoais para 
                fins comerciais.
              </p>
              <p>
                <strong>Transparência:</strong> O código-fonte é aberto e está disponível para 
                auditoria e contribuições da comunidade.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contribuição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="h-6 w-6 text-red-600" />
              Como Contribuir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              O bhub é um projeto da comunidade, para a comunidade. Você pode contribuir de várias formas:
            </p>
            
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Sugerindo feeds:</strong> Indique novos periódicos para incluirmos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Relatando problemas:</strong> Ajude-nos a identificar e corrigir bugs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Desenvolvimento:</strong> Contribua com código e melhorias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span><strong>Divulgação:</strong> Compartilhe o projeto com colegas</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
