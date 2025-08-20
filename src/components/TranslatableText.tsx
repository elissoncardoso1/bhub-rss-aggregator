'use client';

import React from 'react';
import { Languages, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/src/hooks/useTranslation';
import { cn } from '@/src/lib/utils';

interface TranslatableTextProps {
  text: string | null | undefined;
  className?: string;
  showTranslateButton?: boolean;
  autoTranslate?: boolean;
  truncateLength?: number;
  variant?: 'inline' | 'block';
  children?: (props: {
    displayText: string;
    isTranslated: boolean;
    showingTranslation: boolean;
    warning?: string;
  }) => React.ReactNode;
}

/**
 * Componente para exibir texto com opção de tradução
 * Suporta tradução automática e manual do inglês para português
 */
export function TranslatableText({
  text,
  className,
  showTranslateButton = true,
  autoTranslate = false,
  truncateLength,
  variant = 'block',
  children
}: TranslatableTextProps) {
  const {
    displayText,
    isTranslated,
    isLoading,
    provider,
    confidence,
    fromCache,
    processingTime,
    warning,
    error,
    showingTranslation,
    toggleTranslation,
    showOriginal
  } = useTranslation(text, autoTranslate);

  // Verificar se o texto está em inglês (heurística melhorada)
  const isLikelyEnglish = (text: string): boolean => {
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
  };

  const shouldShowTranslateButton = text && isLikelyEnglish(text);
  const hasTranslation = isTranslated;

  // Se não há texto, não renderizar nada
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Aplicar truncamento se especificado
  const finalDisplayText = truncateLength && displayText.length > truncateLength
    ? `${displayText.substring(0, truncateLength)}...`
    : displayText;

  // Se um render prop foi fornecido, usar ele
  if (children) {
    return (
      <div className={cn('relative', className)}>
        {children({
          displayText: finalDisplayText,
          isTranslated,
          showingTranslation,
          warning
        })}
        
        {/* Controles de tradução */}
        {showTranslateButton && shouldShowTranslateButton && (
          <TranslationControls
            isLoading={isLoading}
            isTranslated={isTranslated}
            showingTranslation={showingTranslation}
            hasTranslation={hasTranslation}
            onToggle={toggleTranslation}
            onShowOriginal={showOriginal}
            variant={variant}
            warning={warning}
            error={error}
          />
        )}
      </div>
    );
  }

  // Renderização padrão
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'transition-all duration-200',
        showingTranslation && isTranslated && 'bg-blue-50 border-l-4 border-blue-200 pl-3 py-1 rounded-r'
      )}>
        {variant === 'inline' ? (
          <span className="leading-relaxed">{finalDisplayText}</span>
        ) : (
          <p className="leading-relaxed">{finalDisplayText}</p>
        )}
        
        {/* Indicador de tradução */}
        {showingTranslation && isTranslated && warning && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            <Languages className="h-3 w-3" />
            <span>{warning}</span>
          </div>
        )}
      </div>
      
      {/* Controles de tradução */}
      {showTranslateButton && shouldShowTranslateButton && (
        <TranslationControls
          isLoading={isLoading}
          isTranslated={isTranslated}
          showingTranslation={showingTranslation}
          hasTranslation={hasTranslation}
          onToggle={toggleTranslation}
          onShowOriginal={showOriginal}
          variant={variant}
          warning={warning}
          error={error}
        />
      )}
      
      {/* Erro de tradução */}
      {error && (
        <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Componente interno para controles de tradução
 */
interface TranslationControlsProps {
  isLoading: boolean;
  isTranslated: boolean;
  showingTranslation: boolean;
  hasTranslation: boolean;
  onToggle: () => void;
  onShowOriginal: () => void;
  variant: 'inline' | 'block';
  warning?: string;
  error?: string;
}

function TranslationControls({
  isLoading,
  isTranslated,
  showingTranslation,
  hasTranslation,
  onToggle,
  onShowOriginal,
  variant
}: TranslationControlsProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 mt-2',
      variant === 'inline' && 'inline-flex ml-2'
    )}>
      {/* Botão principal de tradução */}
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all duration-200',
          'hover:scale-105 transform',
          isLoading && 'opacity-50 cursor-not-allowed',
          showingTranslation && isTranslated
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
        title={isTranslated 
          ? (showingTranslation ? 'Ver texto original' : 'Ver tradução')
          : 'Traduzir para português'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Traduzindo...</span>
          </>
        ) : (
          <>
            <Languages className="h-3 w-3" />
            <span>
              {!isTranslated 
                ? 'Traduzir'
                : showingTranslation 
                  ? 'Original'
                  : 'Tradução'
              }
            </span>
          </>
        )}
      </button>
      
      {/* Botão para voltar ao original (apenas quando mostrando tradução) */}
      {showingTranslation && hasTranslation && (
        <button
          onClick={onShowOriginal}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          title="Voltar ao texto original"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Original</span>
        </button>
      )}
    </div>
  );
}

/**
 * Componente simplificado para tradução inline
 */
export function InlineTranslatableText({
  text,
  className,
  showTranslateButton = true,
  truncateLength
}: Omit<TranslatableTextProps, 'variant'>) {
  return (
    <TranslatableText
      text={text}
      className={className}
      showTranslateButton={showTranslateButton}
      truncateLength={truncateLength}
      variant="inline"
    />
  );
}

/**
 * Componente para tradução automática (sem controles visíveis)
 */
export function AutoTranslatableText({
  text,
  className,
  truncateLength,
  variant = 'block'
}: Omit<TranslatableTextProps, 'showTranslateButton' | 'autoTranslate'>) {
  return (
    <TranslatableText
      text={text}
      className={className}
      showTranslateButton={false}
      autoTranslate={true}
      truncateLength={truncateLength}
      variant={variant}
    />
  );
}