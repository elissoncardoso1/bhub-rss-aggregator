# bhub - Agregador RSS de Análise do Comportamento

Um agregador moderno de artigos científicos em Análise do Comportamento Aplicada via RSS/Atom, desenvolvido com tecnologias de ponta para performance, segurança e experiência do usuário.

## 🚀 **Tecnologias & Stack**

### **Core**
- **Next.js 14** (App Router) - Framework React moderno
- **TypeScript** - Tipagem estática e segurança de código
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional robusto

### **Performance & Otimização**
- **@tanstack/react-query** - Gerenciamento de estado e cache de dados
- **lru-cache** - Cache server-side para RSS feeds
- **Framer Motion** - Animações suaves e performáticas

### **Testes & Qualidade**
- **Vitest** - Runner de testes rápido
- **@testing-library/react** - Testes de componentes React
- **MSW** - Mock Service Worker para APIs

### **Observabilidade & Logs**
- **Winston** - Logging estruturado e configurável
- **Sentry** - Monitoramento de erros e performance

### **Segurança**
- **Helmet** - Headers de segurança HTTP
- **rate-limiter-flexible** - Proteção contra ataques de força bruta

### **Inteligência Artificial**
- **HuggingFace API** - Classificação e análise de textos
- Modelos especializados em português

### **UX/UI**
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos e consistentes
- **React Hot Toast** - Notificações elegantes

## 📦 **Instalação**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bhub_ts.git
cd bhub_ts

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas configurações

# Configure o banco de dados
npm run db:generate
npm run db:push

# Execute o projeto
npm run dev
```

## 🔧 **Configuração**

### **Variáveis de Ambiente**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bhub_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# HuggingFace AI
HUGGINGFACE_API_KEY="your-huggingface-api-key-here"

# Sentry (opcional)
SENTRY_DSN="your-sentry-dsn-here"
NEXT_PUBLIC_SENTRY_DSN="your-public-sentry-dsn-here"
```

### **Banco de Dados**

```bash
# Geração do cliente Prisma
npm run db:generate

# Push do schema para o banco
npm run db:push

# Executar migrações
npm run db:migrate

# Seed inicial
npm run db:seed
```

## 🧪 **Testes**

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:ui

# Executar testes uma vez
npm run test:run

# Cobertura de testes
npm run test:coverage
```

## 🔍 **Qualidade & Manutenção**

```bash
# Linting
npm run lint
npm run lint:fix

# Auditoria de segurança
npm run lint:security
npm run security:audit

# Análise de dependências
npm run depcheck
```

## 🚀 **Scripts Disponíveis**

### **Desenvolvimento**
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção

### **Banco de Dados**
- `npm run db:push` - Push do schema
- `npm run db:migrate` - Executar migrações
- `npm run db:seed` - Seed inicial
- `npm run db:studio` - Interface Prisma Studio

### **Qualidade**
- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir problemas de linting
- `npm run test` - Executar testes
- `npm run depcheck` - Analisar dependências

## 🏗️ **Arquitetura**

### **Estrutura de Diretórios**
```
src/
├── app/                 # App Router (Next.js 14)
│   ├── (admin)/        # Rotas administrativas
│   ├── (public)/       # Rotas públicas
│   └── api/            # APIs REST
├── components/          # Componentes React
├── lib/                 # Utilitários e serviços
│   ├── ai/             # Serviços de IA
│   ├── rss/            # Processamento RSS
│   └── cache.ts        # Sistema de cache
├── hooks/               # Hooks personalizados
├── middleware/          # Middlewares (rate limiting, etc.)
└── test/                # Configurações de teste
```

### **Principais Funcionalidades**

#### **1. Performance & Cache**
- **React Query**: Gerenciamento inteligente de estado e cache
- **LRU Cache**: Cache server-side para RSS feeds
- **Otimizações**: Lazy loading, code splitting automático

#### **2. Inteligência Artificial**
- **Classificação de Textos**: Categorização automática de artigos
- **Análise de Sentimento**: Avaliação do tom dos abstracts
- **Extração de Palavras-chave**: Identificação de termos relevantes

#### **3. Segurança**
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Headers de Segurança**: Configurações HTTP seguras
- **Validação**: Sanitização de inputs e outputs

#### **4. Observabilidade**
- **Logging Estruturado**: Winston com formatação JSON
- **Monitoramento**: Sentry para erros e performance
- **Métricas**: Rastreamento de operações críticas

## 🎨 **Componentes Principais**

### **ArticleCard**
Componente responsivo com animações suaves usando Framer Motion:

```tsx
<ArticleCard 
  article={article}
  variant="main"
  showImage={true}
/>
```

### **Sistema de Cache**
Cache inteligente para RSS feeds:

```typescript
import { getFromCache, setInCache } from '@/src/lib/rss/cache'

// Obter do cache
const cached = getFromCache('rss:feed:url')

// Armazenar no cache
setInCache('rss:feed:url', data, 15 * 60 * 1000) // 15 min
```

### **Classificador de IA**
Análise automática de textos:

```typescript
import { textClassifier } from '@/src/lib/ai/textClassifier'

// Classificar título
const classification = await textClassifier.classifyArticleTitle(title)

// Analisar sentimento
const sentiment = await textClassifier.analyzeSentiment(abstract)
```

## 📊 **APIs Disponíveis**

### **Artigos**
- `GET /api/articles/similar/[id]` - Artigos similares
- `POST /api/ai/classify` - Classificação de textos

### **Busca**
- `GET /api/search/suggestions` - Sugestões de busca

### **Administração**
- `GET /api/admin/feeds` - Gerenciar feeds RSS
- `POST /api/admin/feeds/[id]/sync` - Sincronizar feed

## 🔒 **Segurança**

- **Rate Limiting**: Proteção contra spam e ataques
- **Headers de Segurança**: XSS, CSRF, clickjacking
- **Validação de Inputs**: Sanitização e validação rigorosa
- **Autenticação**: NextAuth com múltiplos provedores

## 📈 **Performance**

- **Cache Inteligente**: LRU cache para dados frequentes
- **Lazy Loading**: Carregamento sob demanda
- **Otimizações de Imagem**: Next.js Image com otimizações
- **Code Splitting**: Divisão automática de bundles

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/bhub_ts/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/bhub_ts/wiki)
- **Email**: suporte@bhub.com

---

**Desenvolvido com ❤️ pela equipe bhub**
