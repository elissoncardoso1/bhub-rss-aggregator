'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTranslationManager, UnifiedTranslationResult } from '@/src/lib/translation/translationManager';

interface TranslationState {
  translatedText: string;
  isTranslated: boolean;
  isLoading: boolean;
  sourceLanguage: string;
  provider: string;
  confidence: number;
  fromCache: boolean;
  processingTime: number;
  warning?: string;
  error?: string;
}

/**
 * Hook personalizado para tradução de textos na UI
 * Gerencia o estado da tradução e fornece controles para traduzir/reverter
 * @param originalText - Texto original a ser traduzido
 * @param autoTranslate - Se deve traduzir automaticamente ao montar
 */
export function useTranslation(originalText: string | null | undefined, autoTranslate = false) {
  const [translationState, setTranslationState] = useState<TranslationState>({
    translatedText: originalText || '',
    isTranslated: false,
    isLoading: false,
    sourceLanguage: 'unknown',
    provider: 'none',
    confidence: 0,
    fromCache: false,
    processingTime: 0
  });

  const [showTranslation, setShowTranslation] = useState(false);

  // Função para traduzir o texto
  const translateText = useCallback(async () => {
    if (!originalText || originalText.trim().length === 0) {
      return;
    }

    setTranslationState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const translationManager = getTranslationManager();
      const result = await translationManager.translateText(originalText, {
        targetLanguage: 'pt', // Traduzir para português
        sourceLanguage: 'auto' // Auto-detectar idioma de origem
      });
      
      // Determinar se foi realmente traduzido (não é português para português)
      const wasTranslated = result.translatedText.toLowerCase() !== originalText.toLowerCase();
      
      setTranslationState({
        translatedText: result.translatedText,
        isTranslated: wasTranslated,
        isLoading: false,
        sourceLanguage: 'auto', // O TranslationManager não retorna sourceLanguage detectado
        provider: result.provider,
        confidence: result.confidence,
        fromCache: result.fromCache,
        processingTime: result.processingTime,
        warning: result.confidence < 0.8 ? 'Tradução com baixa confiança' : undefined
      });

      // Se foi traduzido com sucesso, mostrar a tradução
      if (wasTranslated) {
        setShowTranslation(true);
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
      setTranslationState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao traduzir texto'
      }));
    }
  }, [originalText]);

  // Função para alternar entre texto original e traduzido
  const toggleTranslation = useCallback(() => {
    if (!translationState.isTranslated) {
      // Se ainda não foi traduzido, fazer a tradução
      translateText();
    } else {
      // Se já foi traduzido, apenas alternar a visualização
      setShowTranslation(prev => !prev);
    }
  }, [translationState.isTranslated, translateText]);

  // Função para reverter para o texto original
  const showOriginal = useCallback(() => {
    setShowTranslation(false);
  }, []);

  // Função para mostrar a tradução (se disponível)
  const showTranslated = useCallback(() => {
    if (translationState.isTranslated) {
      setShowTranslation(true);
    }
  }, [translationState.isTranslated]);

  // Resetar estado quando o texto original mudar
  useEffect(() => {
    setTranslationState({
      translatedText: originalText || '',
      isTranslated: false,
      isLoading: false,
      sourceLanguage: 'unknown',
      provider: 'none',
      confidence: 0,
      fromCache: false,
      processingTime: 0
    });
    setShowTranslation(false);
  }, [originalText]);

  // Texto a ser exibido (original ou traduzido)
  const displayText = showTranslation && translationState.isTranslated 
    ? translationState.translatedText 
    : originalText || '';

  // Verificar se o texto está em inglês (heurística melhorada)
  const isLikelyEnglish = useCallback((text: string): boolean => {
    if (!text || text.trim().length === 0) return false;
    
    // Palavras comuns em inglês
    const englishWords = ['the', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'by', 'from', 'about', 'through', 'during', 'between', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall'];
    
    // Palavras técnicas comuns em inglês científico
    const technicalWords = ['analysis', 'study', 'research', 'method', 'results', 'conclusion', 'data', 'model', 'algorithm', 'machine', 'learning', 'artificial', 'intelligence', 'healthcare', 'medical', 'clinical', 'patient', 'treatment', 'diagnosis', 'comprehensive', 'review', 'applications', 'effectiveness'];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    const technicalWordCount = words.filter(word => technicalWords.includes(word)).length;
    
    // Critérios mais flexíveis para detecção
     if (words.length <= 3) return false; // Textos muito curtos
     if (englishWordCount >= 2) return true; // Pelo menos 2 palavras comuns
     if (technicalWordCount >= 1 && words.length >= 5) return true; // Pelo menos 1 palavra técnica em texto de 5+ palavras
     if (words.length > 10 && (englishWordCount + technicalWordCount) / words.length > 0.15) return true; // 15% de palavras em inglês
     
     return false;
   }, []);

  // Verificar se deve mostrar o botão de tradução
  const shouldShowTranslateButton = originalText && isLikelyEnglish(originalText);

  // Tradução automática ao montar o componente
  useEffect(() => {
    if (autoTranslate && originalText && shouldShowTranslateButton && !translationState.isTranslated && !translationState.isLoading) {
      translateText();
    }
  }, [autoTranslate, originalText, shouldShowTranslateButton, translationState.isTranslated, translationState.isLoading, translateText]);

  return {
    // Estado da tradução
    displayText,
    isTranslated: translationState.isTranslated,
    isLoading: translationState.isLoading,
    sourceLanguage: translationState.sourceLanguage,
    provider: translationState.provider,
    confidence: translationState.confidence,
    fromCache: translationState.fromCache,
    processingTime: translationState.processingTime,
    warning: translationState.warning,
    error: translationState.error,
    showingTranslation: showTranslation,
    
    // Controles
    translateText,
    toggleTranslation,
    showOriginal,
    showTranslated,
    
    // Utilitários
    shouldShowTranslateButton,
    hasTranslation: translationState.isTranslated
  };
}

/**
 * Hook simplificado para tradução automática
 * Traduz automaticamente textos em inglês quando o componente é montado
 */
export function useAutoTranslation(originalText: string | null | undefined) {
  const translation = useTranslation(originalText, true);
  
  return {
    displayText: translation.showingTranslation ? translation.displayText : originalText || '',
    isTranslated: translation.isTranslated,
    isLoading: translation.isLoading
  };
}