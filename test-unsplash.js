const https = require('https');
require('dotenv').config({ path: '.env.local' });

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY não encontrada no .env.local');
  process.exit(1);
}

console.log('🔑 Chave do Unsplash encontrada:', UNSPLASH_ACCESS_KEY.substring(0, 10) + '...');

// Teste simples da API do Unsplash
const options = {
  hostname: 'api.unsplash.com',
  port: 443,
  path: '/search/photos?query=science&per_page=1',
  method: 'GET',
  headers: {
    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    'User-Agent': 'BHub/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log('📡 Status da resposta:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.results && response.results.length > 0) {
        console.log('✅ API do Unsplash funcionando!');
        console.log('🖼️  Primeira imagem:', response.results[0].urls.small);
        console.log('📊 Total de imagens encontradas:', response.total);
      } else {
        console.log('⚠️  API respondeu mas sem resultados:', response);
      }
    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error.message);
      console.log('📄 Resposta bruta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

req.end();