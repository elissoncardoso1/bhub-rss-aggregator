# 📚 Sistema de Preservação & Consulta - bhub

## 🎯 **Visão Geral**

O **bhub** foi transformado de um simples agregador RSS para um **repositório de consulta científica** focado na preservação do conhecimento em Análise do Comportamento Aplicada.

## 🔒 **Princípios de Preservação**

### **1. Preservação Total**
- **Artigos Antigos**: Mantidos indefinidamente no banco de dados
- **Histórico RSS**: Todo conteúdo sincronizado é preservado
- **Metadados**: Autores, categorias e relacionamentos mantidos
- **Arquivamento**: Sistema inteligente sem perda de dados

### **2. Sistema de Consulta**
- **Busca Avançada**: Múltiplos filtros e critérios
- **Navegação Temporal**: Consulta por ano de publicação
- **Organização Temática**: Categorias e subcategorias
- **Artigos Destacados**: Curadoria para relevância

## ⚙️ **Configurações Implementadas**

### **Cron Jobs Desabilitados**
```typescript
// src/jobs/cron.ts
// LIMPEZA AUTOMÁTICA DESABILITADA - Sistema de consulta
// cron.schedule("0 2 * * 0", async () => {
//   await cleanRepository(365) // DESABILITADO
// })
```

### **Endpoints de Limpeza Desabilitados**
```typescript
// src/app/api/cron/clean/route.ts
// src/app/api/admin/repository/clean/route.ts
// Retornam informação sobre sistema de consulta
```

### **Preservação Automática**
- ✅ Sincronização de feeds: **ATIVA** (a cada hora)
- ❌ Limpeza automática: **DESABILITADA**
- ✅ Arquivamento: **DISPONÍVEL** (manual se necessário)
- ✅ Backup: **RECOMENDADO** (regular)

## 📊 **Funcionalidades de Consulta**

### **Busca e Filtros**
- **Texto**: Título e resumo dos artigos
- **Categoria**: Filtro por área temática
- **Autor**: Busca por pesquisador
- **Ano**: Filtro temporal de publicação
- **Status**: Artigos destacados vs. normais

### **Navegação**
- **Página Principal**: Artigos destacados + recentes
- **Repositório**: Busca avançada e filtros
- **Categorias**: Navegação temática
- **Artigos Individuais**: Visualização completa

## 🚀 **Benefícios da Preservação**

### **Para Pesquisadores**
- **Histórico Completo**: Acesso a todo o acervo científico
- **Busca Avançada**: Encontre artigos específicos rapidamente
- **Contexto Temporal**: Entenda a evolução da área
- **Referências**: Cite trabalhos históricos com confiança

### **Para a Comunidade Científica**
- **Preservação do Conhecimento**: Nada se perde
- **Acessibilidade**: Conteúdo organizado e navegável
- **Colaboração**: Base para novas pesquisas
- **Legado**: Herança científica preservada

## 🔧 **Manutenção e Backup**

### **Recomendações**
1. **Backup Regular**: Banco de dados completo
2. **Monitoramento**: Espaço em disco e performance
3. **Indexação**: Manter índices otimizados
4. **Arquivamento**: Usar sistema de arquivamento se necessário

### **Comandos Úteis**
```bash
# Verificar tamanho do banco
npm run db:check-size

# Backup manual (PostgreSQL)
pg_dump bhub_db > backup_$(date +%Y%m%d).sql

# Verificar artigos antigos
npm run db:check-old-articles

# Estatísticas do repositório
npm run db:stats
```

## 📈 **Métricas de Preservação**

### **Indicadores**
- **Total de Artigos**: Crescimento contínuo
- **Artigos por Ano**: Distribuição temporal
- **Categorias**: Cobertura temática
- **Autores**: Rede de pesquisadores
- **Feeds Ativos**: Fontes de conteúdo

### **Monitoramento**
- **Dashboard Admin**: Estatísticas em tempo real
- **Logs**: Rastreamento de operações
- **Alertas**: Notificações de problemas
- **Relatórios**: Análises periódicas

## 🎯 **Próximos Passos**

### **Funcionalidades Futuras**
- [ ] **Sistema de Tags**: Organização mais granular
- [ ] **Exportação**: Dados em formatos padrão
- [ ] **API Pública**: Acesso programático
- [ ] **Integração**: Outros repositórios científicos
- [ ] **Preservação Digital**: Backup em múltiplas localizações

### **Melhorias de Performance**
- [ ] **Cache Inteligente**: Otimização de consultas
- [ ] **Indexação Avançada**: Busca mais rápida
- [ ] **Compressão**: Economia de espaço
- [ ] **CDN**: Distribuição global de conteúdo

---

**📚 O bhub agora é um verdadeiro repositório de consulta científica, preservando o conhecimento para futuras gerações de pesquisadores em Análise do Comportamento Aplicada.**
