# Sistema de Tradução Profissional

Este documento explica como configurar e usar o novo sistema de tradução profissional que oferece precisão superior a 80% nas traduções.

## 🎯 Objetivo

Substituir o sistema básico de tradução palavra-por-palavra por uma solução robusta que integra com APIs profissionais de tradução, garantindo alta qualidade e precisão nas traduções de resumos de artigos.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Múltiplos Provedores**: Suporte para Google Translate API e sistema básico como fallback
- **Cache Inteligente**: Sistema de cache com expiração automática (7 dias) e limpeza por tamanho
- **Detecção de Idioma**: Algoritmo melhorado para detectar inglês vs português
- **Sistema de Fallback**: Se um provedor falha, tenta o próximo automaticamente
- **Validação de Qualidade**: Aviso quando a confiança da tradução é menor que 80%
- **Logging Detalhado**: Logs completos para monitoramento e debugging

### 🔄 Fluxo de Tradução
1. **Detecção**: Identifica o idioma do texto automaticamente
2. **Cache**: Verifica se a tradução já existe no cache
3. **Provedor Principal**: Tenta Google Translate API (se configurada)
4. **Fallback**: Se falhar, usa sistema básico melhorado
5. **Validação**: Verifica confiança e adiciona avisos se necessário
6. **Cache**: Salva resultado para uso futuro

## ⚙️ Configuração

### 1. Google Translate API (Recomendado)

#### Passo 1: Criar Projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Cloud Translation API**:
   - Vá para "APIs & Services" > "Library"
   - Procure por "Cloud Translation API"
   - Clique em "Enable"

#### Passo 2: Criar Chave de API
1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave gerada
4. (Opcional) Restrinja a chave para maior segurança:
   - Clique na chave criada
   - Em "API restrictions", selecione "Cloud Translation API"

#### Passo 3: Configurar no Projeto
1. Abra o arquivo `.env` na raiz do projeto
2. Substitua `your-google-translate-api-key-here` pela sua chave:
   ```env
   GOOGLE_TRANSLATE_API_KEY="sua-chave-aqui"
   ```

### 2. Verificar Configuração

Para verificar se a API está funcionando, você pode usar o método `getStats()` do serviço:

```typescript
import { professionalTranslationService } from '@/src/lib/translation/professionalTranslationService';

// Verificar status dos provedores
const stats = professionalTranslationService.getStats();
console.log('Provedores disponíveis:', stats.providers);
```

## 🔧 Uso

### No Componente React

O sistema já está integrado ao hook `useTranslation`:

```typescript
import { useTranslation } from '@/src/hooks/useTranslation';

function MeuComponente() {
  const { 
    translatedText, 
    isTranslated, 
    isLoading, 
    error, 
    confidence,
    provider,
    warning,
    toggleTranslation 
  } = useTranslation({
    originalText: "Your English text here",
    autoTranslate: true
  });

  return (
    <div>
      <p>{translatedText}</p>
      {warning && <small className="text-yellow-600">{warning}</small>}
      <button onClick={toggleTranslation}>
        {isTranslated ? 'Mostrar Original' : 'Traduzir'}
      </button>
    </div>
  );
}
```

### Diretamente no Serviço

```typescript
import { professionalTranslationService } from '@/src/lib/translation/professionalTranslationService';

async function traduzirTexto() {
  const resultado = await professionalTranslationService.translateText(
    "This is an English text that needs translation."
  );
  
  console.log('Texto traduzido:', resultado.translatedText);
  console.log('Confiança:', resultado.confidence);
  console.log('Provedor usado:', resultado.provider);
  
  if (resultado.warning) {
    console.warn('Aviso:', resultado.warning);
  }
}
```

## 📊 Monitoramento

### Logs
O sistema gera logs detalhados que podem ser monitorados:

```bash
# Logs de sucesso
[INFO] Tradução realizada com Google Translate API
[INFO] Tradução encontrada no cache

# Logs de aviso
[WARN] Falha no provedor google-translate
[WARN] Tradução com baixa confiança

# Logs de erro
[ERROR] Todos os provedores de tradução falharam
```

### Estatísticas
```typescript
const stats = professionalTranslationService.getStats();
console.log('Cache:', stats.cache.size, '/', stats.cache.maxSize);
console.log('Provedores:', stats.providers);
```

### Limpeza de Cache
```typescript
// Limpar todo o cache
professionalTranslationService.clearCache();
```

## 🎯 Precisão Esperada

| Provedor | Precisão Esperada | Idiomas Suportados |
|----------|-------------------|--------------------|
| Google Translate API | 85-95% | 100+ idiomas |
| Sistema Básico | 60-70% | EN ↔ PT apenas |

## 🔍 Troubleshooting

### Problema: "Google Translate API key não configurada"
**Solução**: Verifique se a variável `GOOGLE_TRANSLATE_API_KEY` está definida no arquivo `.env`

### Problema: "Google Translate API error: 403"
**Solução**: 
1. Verifique se a Cloud Translation API está ativada no seu projeto
2. Confirme se a chave de API tem permissões corretas
3. Verifique se não excedeu os limites de uso

### Problema: Traduções com baixa qualidade
**Solução**: 
1. Verifique se está usando Google Translate API (não o sistema básico)
2. Textos muito técnicos podem ter precisão menor
3. Considere revisar traduções importantes manualmente

### Problema: Tradução muito lenta
**Solução**:
1. O cache deve acelerar traduções repetidas
2. Verifique a conexão com a internet
3. Considere aumentar o tempo de cache se necessário

## 💰 Custos (Google Translate API)

- **Gratuito**: Até 500.000 caracteres por mês
- **Pago**: $20 por 1 milhão de caracteres adicionais
- **Estimativa**: ~2000 resumos de 200 caracteres = 400.000 caracteres/mês

## 🔄 Próximos Passos

1. **Integração com DeepL**: Para ainda maior precisão
2. **Cache Persistente**: Salvar cache em banco de dados
3. **Métricas de Qualidade**: Sistema de feedback dos usuários
4. **Tradução em Lote**: Otimizar para múltiplas traduções simultâneas

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Integração com Google Translate API
- ✅ Sistema de fallback robusto
- ✅ Cache inteligente com expiração
- ✅ Detecção de idioma melhorada
- ✅ Validação de qualidade com avisos
- ✅ Logging detalhado para monitoramento

---

**Nota**: Este sistema substitui completamente o `uiTranslationService.ts` anterior, oferecendo muito maior precisão e confiabilidade nas traduções.