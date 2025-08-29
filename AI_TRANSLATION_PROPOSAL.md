# Sistema de Tradução com IA Local - DESABILITADO

> ⚠️ **AVISO**: Esta funcionalidade está atualmente **DESABILITADA** para reduzir o tamanho do bundle e dependências.
> 
> Para reativar, siga as instruções na seção "Reativação" no final deste documento.

## Visão Geral

Esta documentação detalha a implementação de um sistema de tradução com IA local para o projeto bhub, utilizando modelos de linguagem executados diretamente no servidor, sem dependência de APIs externas.

## Contexto Atual

### Sistema de Classificação (ML) Existente
- **Modelo**: `neuralmind/bert-base-portuguese-cased`
- **Biblioteca**: `@xenova/transformers`
- **Funciona 100% offline** após download inicial
- **Performance**: ~100-500ms por classificação
- **Tamanho**: ~110MB download inicial

### Sistema de Tradução Atual
- **Provedor Principal**: Google Translate API (pago)
- **Fallback**: Sistema básico com heurísticas
- **Limitações**: Dependência de internet, custos, privacidade

## Proposta: Sistema de Tradução com IA Local

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    Translation Manager                       │
├─────────────────────────────────────────────────────────────┤
│  1. AI Local Translation (Novo)                            │
│     - Modelos NLLB/MarianMT via @xenova/transformers       │
│     - Funciona offline                                      │
│     - Múltiplos idiomas                                     │
│                                                             │
│  2. Google Translate API (Existente)                       │
│     - Alta precisão                                         │
│     - Requer internet + API key                            │
│                                                             │
│  3. Basic Translation (Fallback)                           │
│     - Heurísticas simples                                  │
│     - Sempre disponível                                    │
└─────────────────────────────────────────────────────────────┘
```

### Modelos de IA Recomendados

#### 1. NLLB-200 (No Language Left Behind)
- **Modelo**: `Xenova/nllb-200-distilled-600M`
- **Idiomas**: 200+ idiomas suportados
- **Tamanho**: ~600MB
- **Qualidade**: Alta para a maioria dos pares de idiomas
- **Desenvolvido por**: Meta AI

#### 2. MarianMT
- **Modelos**: Específicos por par de idiomas (ex: `Xenova/opus-mt-en-pt`)
- **Tamanho**: ~300MB por modelo
- **Qualidade**: Muito alta para pares específicos
- **Vantagem**: Modelos especializados

#### 3. M2M100
- **Modelo**: `Xenova/m2m100_418M`
- **Idiomas**: 100 idiomas
- **Tamanho**: ~418MB
- **Qualidade**: Boa para tradução multilíngue

### Implementação Técnica

#### Estrutura de Arquivos
```
src/lib/translation/
├── aiTranslationService.ts      # Novo serviço de IA local
├── translationManager.ts        # Gerenciador unificado
├── models/
│   ├── nllbTranslator.ts       # Implementação NLLB
│   ├── marianTranslator.ts     # Implementação MarianMT
│   └── modelManager.ts         # Gerenciador de modelos
└── config.ts                   # Configurações
```

#### Exemplo de Implementação

```typescript
// aiTranslationService.ts
import { pipeline } from '@xenova/transformers';

export class AITranslationService {
  private translator: any = null;
  private modelName = 'Xenova/nllb-200-distilled-600M';
  
  async initialize(): Promise<void> {
    this.translator = await pipeline(
      'translation', 
      this.modelName,
      { 
        dtype: 'q8', // Quantização para reduzir tamanho
        device: 'cpu' // ou 'webgpu' se disponível
      }
    );
  }
  
  async translateText(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string
  ): Promise<TranslationResult> {
    if (!this.translator) {
      throw new Error('AI Translation service not initialized');
    }
    
    const result = await this.translator(text, {
      src_lang: this.mapLanguageCode(sourceLanguage),
      tgt_lang: this.mapLanguageCode(targetLanguage)
    });
    
    return {
      translatedText: result[0].translation_text,
      confidence: 0.85, // Estimativa baseada no modelo
      provider: 'ai-local',
      fromCache: false
    };
  }
}
```

### Estratégia de Fallback Inteligente

```typescript
// translationManager.ts
export class TranslationManager {
  private providers = [
    new AITranslationService(),      // 1ª opção: IA Local
    new GoogleTranslateService(),    // 2ª opção: Google API
    new BasicTranslationService()    // 3ª opção: Fallback
  ];
  
  async translateText(text: string): Promise<TranslationResult> {
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          return await provider.translateText(text);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        continue; // Tenta próximo provider
      }
    }
    
    throw new Error('All translation providers failed');
  }
}
```

## Vantagens da Abordagem com IA Local

### ✅ Benefícios

1. **Privacidade Total**
   - Textos não saem do dispositivo
   - Sem envio de dados para APIs externas
   - Conformidade com LGPD/GDPR

2. **Custo Zero Operacional**
   - Sem custos por tradução após setup inicial
   - Sem limites de uso
   - Sem dependência de APIs pagas

3. **Disponibilidade Offline**
   - Funciona sem internet
   - Não depende de status de APIs externas
   - Maior confiabilidade

4. **Performance Consistente**
   - Latência previsível (~500ms-2s)
   - Sem variações por tráfego de rede
   - Controle total sobre recursos

5. **Múltiplos Idiomas**
   - NLLB suporta 200+ idiomas
   - Cobertura superior a muitas APIs
   - Especialização em idiomas menos comuns

### ⚠️ Considerações

1. **Tamanho dos Modelos**
   - NLLB: ~600MB
   - MarianMT: ~300MB por par de idiomas
   - Impacto no tempo de carregamento inicial

2. **Uso de Memória**
   - Modelos consomem RAM adicional
   - Pode impactar performance em dispositivos limitados

3. **Qualidade Variável**
   - Pode ser inferior a Google Translate para alguns pares
   - Necessário teste extensivo por idioma

4. **Tempo de Inicialização**
   - Download inicial pode demorar
   - Carregamento do modelo: ~10-30 segundos

## Comparação de Abordagens

| Aspecto | IA Local | Google API | Sistema Básico |
|---------|----------|------------|----------------|
| **Qualidade** | Alta (85-90%) | Muito Alta (95%+) | Baixa (60-70%) |
| **Custo** | Zero* | $20/1M chars | Zero |
| **Privacidade** | Excelente | Limitada | Excelente |
| **Offline** | ✅ Sim | ❌ Não | ✅ Sim |
| **Latência** | 500ms-2s | 200-500ms | <100ms |
| **Setup** | Complexo | Simples | Simples |
| **Idiomas** | 200+ | 100+ | 2 |

*Custo zero após download inicial

## Implementação Recomendada

### Fase 1: Prova de Conceito (1-2 semanas)
- [ ] Implementar AITranslationService básico
- [ ] Integrar NLLB-200 distilled
- [ ] Testes com português ↔ inglês
- [ ] Comparação de qualidade com sistema atual

### Fase 2: Integração (1 semana)
- [ ] Criar TranslationManager unificado
- [ ] Implementar sistema de fallback
- [ ] Integrar com componentes existentes
- [ ] Testes de integração

### Fase 3: Otimização (1 semana)
- [ ] Implementar cache inteligente
- [ ] Otimizar carregamento de modelos
- [ ] Adicionar métricas de performance
- [ ] Testes de carga

### Fase 4: Produção (1 semana)
- [ ] Configuração de ambiente
- [ ] Documentação completa
- [ ] Monitoramento e logs
- [ ] Deploy e testes finais

## Configuração Recomendada

### Variáveis de Ambiente
```env
# Configuração de tradução
AI_TRANSLATION_ENABLED=true
AI_TRANSLATION_MODEL=nllb-200-distilled-600M
AI_TRANSLATION_QUANTIZATION=q8
AI_TRANSLATION_CACHE_SIZE=1000

# Fallback para Google API
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
GOOGLE_TRANSLATE_ENABLED=true

# Configurações de performance
AI_TRANSLATION_MAX_LENGTH=1000
AI_TRANSLATION_TIMEOUT=30000
```

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: [
      '@xenova/transformers',
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};
```

## Métricas de Sucesso

### Qualidade
- [ ] Precisão ≥ 85% em testes com textos acadêmicos
- [ ] Cobertura de 95%+ dos textos do sistema
- [ ] Satisfação dos usuários ≥ 4.0/5.0

### Performance
- [ ] Tempo de tradução ≤ 2 segundos
- [ ] Tempo de inicialização ≤ 30 segundos
- [ ] Uso de memória ≤ 1GB adicional

### Confiabilidade
- [ ] Disponibilidade ≥ 99.5%
- [ ] Taxa de erro ≤ 1%
- [ ] Fallback funcional em 100% dos casos

## Conclusão

A implementação de um sistema de tradução com IA local representa uma evolução natural do projeto, aproveitando a expertise já desenvolvida com o sistema de classificação ML. A abordagem híbrida proposta oferece:

1. **Melhor experiência do usuário**: Traduções rápidas e privadas
2. **Redução de custos**: Eliminação de dependência de APIs pagas
3. **Maior confiabilidade**: Funcionamento offline e fallback robusto
4. **Escalabilidade**: Sem limites de uso ou throttling

A implementação gradual em fases permite validação contínua e ajustes baseados em feedback real, garantindo uma transição suave e bem-sucedida.

## Reativação da Funcionalidade

> Esta seção contém instruções para reativar a tradução por IA local quando necessário.

### Passo 1: Instalar Dependências
```bash
npm install @xenova/transformers onnxruntime-node
```

### Passo 2: Reativar Configurações
1. **next.config.js**: Descomente as configurações relacionadas a `@xenova/transformers`
2. **aiTranslationService.ts**: Descomente os imports e código da classe
3. **translationManager.ts**: Ajuste a ordem de provedores para incluir 'ai-local' primeiro

### Passo 3: Variáveis de Ambiente
```env
AI_TRANSLATION_ENABLED=true
AI_TRANSLATION_MODEL=nllb-200-distilled-600M
```

### Passo 4: Testes
1. Execute os testes de tradução
2. Verifique a integração com o TranslationManager
3. Teste o fallback para outros provedores

---

**Status**: DESABILITADO  
**Última Atualização**: Janeiro 2025  
**Versão**: 1.1