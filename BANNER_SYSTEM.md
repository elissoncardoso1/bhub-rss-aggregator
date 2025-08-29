# 🎯 Sistema de Banners - bhub

## 📋 Visão Geral

O sistema de banners do **bhub** foi implementado para mostrar claramente os espaços disponíveis para publicidade e conteúdo promocional. Quando não há banners ativos, o sistema exibe indicadores visuais informativos.

## 🎨 Posições Disponíveis

### 1. **Header** (`HEADER`)
- **Localização**: Topo da página, logo após a navegação
- **Tamanho**: Responsivo (h-16 mobile, h-20 tablet, h-24 desktop)
- **Estilo**: Azul com gradiente
- **Ícone**: Megaphone (📢)
- **Descrição**: "Espaço para Banner - Header - Área de destaque principal"

### 2. **Sidebar** (`SIDEBAR`)
- **Localização**: Barra lateral direita do repositório
- **Tamanho**: Responsivo (h-32 mobile, h-64 desktop)
- **Estilo**: Verde com gradiente
- **Ícone**: Image (🖼️)
- **Descrição**: "Banner Lateral - Sidebar - Área de promoção"

### 3. **Entre Artigos** (`BETWEEN_ARTICLES`)
- **Localização**: Entre seções de conteúdo na página principal
- **Tamanho**: Responsivo (h-20 mobile, h-24 desktop)
- **Estilo**: Roxo com gradiente
- **Ícone**: Link (🔗)
- **Descrição**: "Banner Entre Artigos - Área de conexão e promoção"

### 4. **Footer** (`FOOTER`)
- **Localização**: Rodapé da página, antes do footer
- **Tamanho**: Responsivo (h-16 mobile, h-20 desktop)
- **Estilo**: Laranja com gradiente
- **Ícone**: Megaphone (📢)
- **Descrição**: "Banner Rodapé - Footer - Área de encerramento"

## 🔧 Implementação Técnica

### Componente BannerAd
```tsx
<BannerAd 
  position="header"           // Posição do banner
  showPlaceholder={true}      // Mostrar placeholder quando não há banners
  maxBanners={1}              // Máximo de banners por posição
  className="custom-class"    // Classes CSS customizadas
/>
```

### Propriedades
- **`position`**: Define a posição do banner
- **`showPlaceholder`**: Controla se mostra indicador visual (padrão: true)
- **`maxBanners`**: Número máximo de banners por posição
- **`className`**: Classes CSS adicionais

## 🎨 Design dos Placeholders

### Características Visuais
- **Bordas**: Tracejadas (dashed) com cores específicas por posição
- **Gradientes**: Fundos suaves com cores temáticas
- **Ícones**: Lucide React icons representativos
- **Hover Effects**: Transições suaves e sombras
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### Cores por Posição
- **Header**: Azul → Índigo
- **Sidebar**: Verde → Esmeralda  
- **Entre Artigos**: Roxo → Rosa
- **Footer**: Laranja → Vermelho

## 📱 Responsividade

### Breakpoints
- **Mobile**: max-width: 768px
- **Tablet**: 769px - 1024px
- **Desktop**: min-width: 1025px

### Adaptações
- Alturas ajustadas por dispositivo
- Layouts otimizados para cada tamanho
- Ícones e textos proporcionais

## 🚀 Como Usar

### 1. **Adicionar Banner em Nova Página**
```tsx
import { BannerAd } from "@/src/components/BannerAd"

// Em qualquer componente
<BannerAd position="sidebar" />
```

### 2. **Personalizar Estilo**
```tsx
<BannerAd 
  position="header"
  className="my-custom-banner"
  showPlaceholder={false}  // Ocultar placeholder
/>
```

### 3. **Múltiplos Banners**
```tsx
<BannerAd 
  position="between-articles"
  maxBanners={3}  // Até 3 banners
/>
```

## 🔒 Configuração de Banners

### Banco de Dados
Os banners são gerenciados através do modelo `Banner` no Prisma:

```prisma
model Banner {
  id          String      @id @default(cuid())
  title       String
  imageUrl    String?
  linkUrl     String?
  htmlContent String?     @db.Text
  position    BannerPosition
  isActive    Boolean     @default(true)
  priority    Int         @default(0)
  startDate   DateTime?
  endDate     DateTime?
  clickCount  Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### API Endpoints
- `GET /api/banners/[position]` - Listar banners por posição
- `POST /api/banners/[id]/click` - Registrar clique
- `GET /api/admin/banners` - Gerenciar banners (admin)

## 🎯 Benefícios

### Para Desenvolvedores
- **Visibilidade**: Espaços de banner claramente identificados
- **Flexibilidade**: Fácil adição em novas páginas
- **Consistência**: Design uniforme em todo o sistema

### Para Administradores
- **Controle**: Gerenciamento centralizado de banners
- **Métricas**: Rastreamento de cliques e performance
- **Agendamento**: Controle de datas de início/fim

### Para Usuários
- **Clareza**: Espaços promocionais bem definidos
- **Experiência**: Interface limpa e organizada
- **Navegação**: Separação clara entre conteúdo e publicidade

## 🔮 Futuras Melhorias

### Funcionalidades Planejadas
- **A/B Testing**: Teste de diferentes versões de banners
- **Segmentação**: Banners específicos por usuário/categoria
- **Analytics Avançado**: Métricas detalhadas de performance
- **Templates**: Modelos pré-definidos para banners
- **Integração AdSense**: Suporte nativo ao Google AdSense

### Otimizações
- **Lazy Loading**: Carregamento sob demanda
- **Cache Inteligente**: Cache de banners por posição
- **Compressão**: Otimização de imagens automática
- **CDN**: Distribuição global de conteúdo

---

**Desenvolvido com ❤️ pela equipe bhub**

*Sistema de banners implementado para maximizar a visibilidade e organização do conteúdo promocional.*
