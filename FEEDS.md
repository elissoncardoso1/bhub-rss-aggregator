# 📡 Feeds RSS/Atom - bhub

Este documento lista todos os feeds RSS/Atom de revistas e publicações em Análise do Comportamento integrados ao projeto bhub.

## 🚀 Como Adicionar os Feeds

### 1. Executar o Script de Feeds Reais

```bash
# Adicionar todos os feeds reais ao banco de dados
npm run db:seed-feeds
```

### 2. Sincronizar os Feeds

```bash
# Verificar status dos feeds e instruções de sincronização
npm run db:sync

# Ou sincronizar via API
curl -X POST http://localhost:3000/api/admin/sync-all
```

### 3. Via Painel Administrativo

1. Acesse `http://localhost:3000/admin`
2. Faça login como `admin@bhub.com` / `admin123`
3. Clique em "Sincronizar Todos os Feeds"

## 🇧🇷 Feeds Brasileiros

| Revista/Publicação | Área | Status | URL do Feed |
|-------------------|------|--------|-------------|
| **Revista Perspectivas em Análise do Comportamento** | Behaviorismo Radical / ABA | ✅ Ativo | `https://revistaperspectivas.org/perspectivas/gateway/plugin/WebFeedGatewayPlugin/rss2` |
| **Revista ESPECTRO (UFSCar)** | ABA (Autismo) | ✅ Ativo | `https://www.espectro.ufscar.br/index.php/1979/gateway/plugin/WebFeedGatewayPlugin/rss2` |
| **Boletim Contexto (ABPMC)** | Análise do Comportamento (informativo) | ✅ Ativo | `https://boletimcontexto.wordpress.com/feed` |
| **Portal Comporte-se** | Análise do Comportamento (divulgação) | ✅ Ativo | `https://comportese.com/feed` |
| **Revista Brasileira de Análise do Comportamento (RBAC)** | Análise do Comportamento | ❌ Sem feed | *Sem feed RSS disponível* |

## 🇺🇸 Feeds Internacionais

| Journal/Publication | Área | Status | URL do Feed |
|--------------------|------|--------|-------------|
| **Journal of Applied Behavior Analysis (JABA)** | ABA (experimental aplicada) | ✅ Ativo | `https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3703` |
| **Journal of the Experimental Analysis of Behavior (JEAB)** | Análise Experimental do Comportamento | ✅ Ativo | `https://onlinelibrary.wiley.com/rss/journal/10.1002/(ISSN)1938-3711` |
| **Journal of Organizational Behavior Management (JOBM)** | OBM | ✅ Ativo | `https://www.tandfonline.com/feed/rss/worg20` |
| **Behavior Analysis in Practice (BAP)** | ABA (prática clínica) | ✅ Ativo | `https://link.springer.com/search.rss?facet-journal-id=40617&facet-content-type=Article` |
| **Perspectives on Behavior Science** | Teoria e Revisões | ✅ Ativo | `https://link.springer.com/search.rss?facet-journal-id=40614&facet-content-type=Article` |
| **The Analysis of Verbal Behavior (TAVB)** | Comportamento Verbal | ✅ Ativo | `https://link.springer.com/search.rss?facet-journal-id=40616&facet-content-type=Article` |
| **Behavior and Social Issues (BSI)** | ABA e questões sociais | ✅ Ativo | `https://link.springer.com/search.rss?facet-journal-id=42822&facet-content-type=Article` |
| **OBM Network News (Newsletter)** | OBM (informativo institucional) | ✅ Ativo | `http://www.obmnetwork.com/resource/rss/news.rss` |
| **Behavior and Philosophy** | Filosofia e Behaviorismo | ❌ Sem feed | *Sem feed RSS disponível* |

## 📂 Categorias Disponíveis

As seguintes categorias foram criadas para organizar os artigos:

- **Terapia Comportamental** - Intervenções terapêuticas baseadas em ABA
- **Análise Experimental** - Pesquisas experimentais em análise do comportamento  
- **Educação** - Aplicações educacionais da análise do comportamento
- **Clínica** - Aplicações clínicas e terapêuticas
- **Organizacional** - Comportamento organizacional e gestão (OBM)
- **Comportamento Verbal** - Análise do comportamento verbal e linguagem
- **Questões Sociais** - Aplicações da ABA em questões sociais e comunitárias
- **Autismo** - Intervenções comportamentais para transtorno do espectro autista
- **Filosofia Behaviorista** - Fundamentos filosóficos da análise do comportamento

## ⚙️ Configuração de Sincronização

### Frequência Padrão
- **Sincronização**: A cada 1 hora (3600 segundos)
- **Cron Job**: Configurável via `/api/cron/sync`

### Monitoramento
- Acesse o painel administrativo para monitorar:
  - Status dos feeds (ativo/inativo)
  - Última sincronização
  - Contadores de erro
  - Total de artigos por feed

### Troubleshooting

**Problema: Feed não sincroniza**
- Verifique se o URL do feed está acessível
- Confirme se o feed está marcado como ativo
- Verifique logs de erro no painel administrativo

**Problema: Artigos duplicados**
- O sistema usa `externalId` para evitar duplicatas
- Verifique se o feed fornece IDs únicos consistentes

**Problema: Categorização incorreta**
- A categorização é feita automaticamente por palavras-chave
- Ajuste manual pode ser feita via painel administrativo

## 🔧 Scripts Disponíveis

```bash
# Adicionar feeds reais
npm run db:seed-feeds

# Verificar status e sincronizar
npm run db:sync

# Seed completo (dados de exemplo + feeds)
npm run db:seed

# Abrir Prisma Studio para visualizar dados
npm run db:studio
```

## 📊 Estatísticas

Após a sincronização, você terá acesso a:
- **Total de feeds ativos**: 12 feeds
- **Feeds brasileiros**: 4 feeds
- **Feeds internacionais**: 8 feeds
- **Idiomas**: Português (pt-BR) e Inglês (en)
- **Tipos de feed**: RSS, RSS2, Atom

## 🌐 APIs Relacionadas

- `GET /api/stats` - Estatísticas gerais do repositório
- `POST /api/admin/sync-all` - Sincronizar todos os feeds
- `POST /api/admin/feeds/{id}/sync` - Sincronizar feed específico
- `POST /api/cron/sync` - Sincronização via cron job
- `GET /api/admin/feeds` - Listar todos os feeds
- `POST /api/admin/feeds` - Criar novo feed

## 📝 Notas Importantes

1. **Feeds sem RSS**: Algumas revistas importantes (RBAC, Behavior and Philosophy) não possuem feeds RSS públicos
2. **Rate Limiting**: Respeite os limites de requisição dos servidores dos feeds
3. **Backup**: Faça backup regular do banco de dados antes de grandes sincronizações
4. **Monitoramento**: Configure alertas para feeds que falham consistentemente

---

Para mais informações sobre a estrutura do projeto, consulte o README.md principal.
