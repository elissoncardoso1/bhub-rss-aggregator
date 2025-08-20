# Sistema de ML para Classificação de Artigos

## Visão Geral

Este documento descreve o sistema de Machine Learning implementado para classificação automática de artigos acadêmicos no projeto **bhub**. O sistema utiliza embeddings locais para classificar artigos em categorias predefinidas, funcionando 100% offline após a inicialização.

## Arquitetura

### Componentes Principais

1. **`setupEmbeddings.ts`** - Gerenciador de embeddings e inicialização do modelo
2. **`embedClassifier.ts`** - Classificador principal usando similaridade cosseno
3. **`index.ts`** - Interface unificada para todas as funcionalidades de ML

### Fluxo de Funcionamento

```
1. Inicialização → Carrega modelo local
2. Cálculo de Centroides → Gera embeddings das categorias
3. Classificação → Compara novos textos com centroides
4. Fallback → Sistema de palavras-chave se ML falhar
```

## Categorias Suportadas

- **Clínica**: Terapia, psicologia clínica, tratamento
- **Educação**: Ensino, pedagogia, educação especial
- **Organizacional**: Psicologia organizacional, gestão
- **Pesquisa**: Metodologia, estudos experimentais
- **Outros**: Análise do comportamento, psicologia geral

## Configuração

### Dependências

```bash
npm install @xenova/transformers
```

### Variáveis de Ambiente

```env
# O sistema funciona sem variáveis de ambiente
# Todos os modelos são baixados e armazenados localmente
```

### Next.js

O `next.config.js` foi configurado para:
- Permitir pacotes externos do servidor
- Configurar webpack para arquivos de modelo
- Excluir arquivos grandes do tracing

## Uso

### Inicialização

```typescript
import { initializeEmbeddings } from '@/src/lib/ml'

// Inicializa o sistema (pode demorar na primeira vez)
await initializeEmbeddings()
```

### Classificação de Artigos

```typescript
import { classifyArticle } from '@/src/lib/ml'

const result = await classifyArticle(
  'Título do artigo',
  'Abstract do artigo',
  ['palavra-chave1', 'palavra-chave2']
)

if (result) {
  console.log(`Categoria: ${result.category}`)
  console.log(`Confiança: ${result.confidence}`)
}
```

### Verificação de Status

```typescript
import { isEmbeddingSystemReady } from '@/src/lib/ml'

if (isEmbeddingSystemReady()) {
  console.log('Sistema ML está pronto')
}
```

## Integração com FeedAggregatorService

O sistema foi integrado ao `FeedAggregatorService` para classificação automática durante a sincronização de feeds:

```typescript
// O método determineCategoryId agora usa o classificador de ML
const categoryId = await this.determineCategoryId(
  parsedData.title, 
  parsedData.abstract, 
  parsedData.keywords
)
```

## Fallback

Se o sistema de ML falhar ou não estiver pronto, o sistema automaticamente usa o método anterior baseado em palavras-chave, garantindo que a classificação continue funcionando.

## Performance

### Primeira Execução
- **Download do modelo**: ~50MB (depende da conexão)
- **Cálculo de centroides**: ~10-30 segundos
- **Total**: ~1-2 minutos

### Execuções Subsequentes
- **Carregamento do modelo**: ~5-10 segundos
- **Classificação por artigo**: ~100-500ms

## Testes

### Script de Teste

```bash
npm run test:ml
```

Este script testa:
- Inicialização do sistema
- Classificação de artigos de exemplo
- Verificação de status
- Informações do sistema

### Artigos de Teste

O script inclui 5 artigos de exemplo cobrindo todas as categorias para validação do sistema.

## Manutenção

### Atualização de Categorias

Para adicionar/modificar categorias, edite o arquivo `setupEmbeddings.ts`:

```typescript
const CATEGORY_EXAMPLES: Record<string, string[]> = {
  'Nova Categoria': [
    'exemplo1',
    'exemplo2',
    // ...
  ]
}
```

### Troca de Modelo

Para usar um modelo diferente:

1. Altere `modelName` em `setupEmbeddings.ts`
2. Ajuste os exemplos das categorias se necessário
3. Execute o script de teste para validação

## Troubleshooting

### Erro: "Modelo não encontrado"
- Verifique se o `@xenova/transformers` está instalado
- Execute `npm run test:ml` para verificar o status

### Erro: "Sistema não inicializado"
- Aguarde a inicialização completa
- Verifique logs para erros específicos

### Performance Lenta
- Primeira execução sempre é mais lenta
- Verifique se o modelo está sendo carregado do cache local

## Limitações Atuais

1. **Tamanho do modelo**: ~50MB para download inicial
2. **Tempo de inicialização**: Requer alguns segundos para carregar
3. **Memória**: Consome memória adicional para o modelo em RAM

## Roadmap

- [ ] Cache de embeddings para artigos já processados
- [ ] Modelos quantizados para menor uso de memória
- [ ] Sistema de feedback para melhorar classificação
- [ ] API para reclassificação de artigos existentes

## Suporte

Para questões relacionadas ao sistema de ML:
1. Verifique os logs do sistema
2. Execute o script de teste
3. Consulte este documento
4. Abra uma issue no repositório
