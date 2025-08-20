#!/usr/bin/env npx tsx

import { getAITranslationService } from '../src/lib/translation/aiTranslationService';
import fs from 'fs';
import path from 'path';

/**
 * Script para verificar o tamanho do modelo NLLB-200 e informações relacionadas
 */
async function checkModelSize() {
  console.log('🔍 Verificando informações do modelo NLLB-200...');
  console.log('=' .repeat(60));

  // Informações do modelo configurado
  const aiService = getAITranslationService();
  const modelInfo = aiService.getModelInfo();
  
  console.log('📋 Informações do Modelo:');
  console.log(`   Nome: ${modelInfo.name}`);
  console.log(`   Inicializado: ${modelInfo.initialized}`);
  console.log('');

  // Informações técnicas do NLLB-200-distilled-600M
  console.log('📊 Especificações Técnicas do NLLB-200-distilled-600M:');
  console.log('   Parâmetros: 600M (destilado do modelo original de 54.5B)');
  console.log('   Arquitetura: Transformer (encoder-decoder)');
  console.log('   Idiomas suportados: 200 idiomas');
  console.log('   Tamanho máximo de entrada: 1024 tokens');
  console.log('   Licença: CC BY-NC 4.0 (apenas para pesquisa)');
  console.log('   Desenvolvedor: Meta AI (Facebook)');
  console.log('');

  // Comparação com outras variantes
  console.log('🔄 Modelos de Tradução Disponíveis:');
  console.log('   • NLLB-200-distilled-600M: 600M parâmetros (atual - balanceado)');
  console.log('   • NLLB-200-distilled-1.3B: 1.3B parâmetros - Maior qualidade');
  console.log('   • NLLB-200-3.3B: 3.3B parâmetros - Alta qualidade');
  console.log('   • NLLB-200 (original): 200B parâmetros - Modelo completo');
  console.log('   • MarianMT (alternativa): ~300MB por par de idiomas');
  console.log('');

  // Verificar se o modelo foi baixado/cached
  console.log('💾 Status do Cache Local:');
  try {
    // Tentar inicializar o serviço para verificar se o modelo está disponível
    console.log('   Inicializando serviço de tradução...');
    await aiService.initialize();
    
    const updatedModelInfo = aiService.getModelInfo();
    console.log(`   ✅ Modelo inicializado: ${updatedModelInfo.initialized}`);
    
    // Verificar estatísticas de cache
    const cacheStats = aiService.getCacheStats();
    console.log(`   Cache de traduções: ${cacheStats.size}/${cacheStats.maxSize} entradas`);
    
    if (cacheStats.hitRate !== undefined) {
      console.log(`   Taxa de acerto do cache: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    }
    
  } catch (error) {
    console.log(`   ❌ Erro ao inicializar: ${error}`);
  }
  
  console.log('');

  // Informações sobre o tamanho do download
  console.log('📥 Informações de Download:');
  console.log('   O modelo NLLB-200-distilled-600M é baixado automaticamente');
  console.log('   na primeira execução via @xenova/transformers.');
  console.log('   ');
  console.log('   Tamanho estimado do download:');
  console.log('   • Modelo principal: ~1.2GB');
  console.log('   • Tokenizer: ~2MB');
  console.log('   • Total aproximado: ~1.2GB');
  console.log('');
  console.log('   Local de cache (típico):');
  console.log('   • macOS: ~/.cache/huggingface/transformers/');
  console.log('   • Linux: ~/.cache/huggingface/transformers/');
  console.log('   • Windows: %USERPROFILE%\.cache\\huggingface\\transformers\\');
  console.log('');

  // Verificar se existe cache local
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const cacheDir = path.join(homeDir, '.cache', 'huggingface', 'transformers');
  
  if (fs.existsSync(cacheDir)) {
    console.log('🗂️  Cache Local Encontrado:');
    console.log(`   Diretório: ${cacheDir}`);
    
    try {
      const files = fs.readdirSync(cacheDir);
      const modelFiles = files.filter(file => file.includes('nllb') || file.includes('Xenova'));
      
      if (modelFiles.length > 0) {
        console.log(`   Arquivos relacionados ao modelo: ${modelFiles.length}`);
        
        // Calcular tamanho total aproximado
        let totalSize = 0;
        for (const file of modelFiles) {
          try {
            const filePath = path.join(cacheDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
              // Para diretórios, somar arquivos internos
              const subFiles = fs.readdirSync(filePath);
              for (const subFile of subFiles) {
                const subFilePath = path.join(filePath, subFile);
                const subStats = fs.statSync(subFilePath);
                if (subStats.isFile()) {
                  totalSize += subStats.size;
                }
              }
            } else {
              totalSize += stats.size;
            }
          } catch (e) {
            // Ignorar erros de acesso a arquivos
          }
        }
        
        if (totalSize > 0) {
          const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
          const sizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
          console.log(`   Tamanho total no cache: ${sizeInMB} MB (${sizeInGB} GB)`);
        }
      } else {
        console.log('   Nenhum arquivo do modelo encontrado no cache');
      }
    } catch (error) {
      console.log(`   Erro ao verificar cache: ${error}`);
    }
  } else {
    console.log('📁 Cache local não encontrado (modelo será baixado na primeira execução)');
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log('✅ Verificação concluída!');
}

// Executar o script
checkModelSize().catch(console.error);