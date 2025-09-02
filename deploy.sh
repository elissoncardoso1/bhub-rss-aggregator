#!/bin/bash

# 🚀 Script de Deploy Automatizado para Hostinger
# Uso: ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do bhub para Hostinger..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto"
fi

# 1. Verificar se o build existe
log "Verificando build de produção..."
if [ ! -d ".next" ]; then
    log "Criando build de produção..."
    npm run build
    success "Build criado com sucesso"
else
    log "Build já existe, pulando..."
fi

# 2. Verificar variáveis de ambiente
log "Verificando configurações..."
if [ ! -f ".env.production" ]; then
    warning "Arquivo .env.production não encontrado"
    warning "Crie o arquivo com as configurações de produção"
    warning "Use o arquivo env.production.example como base"
fi

# 3. Verificar se o Git está configurado
log "Verificando configuração do Git..."
if ! git remote -v | grep -q "origin"; then
    warning "Remote 'origin' não configurado"
    warning "Configure com: git remote add origin https://github.com/elissoncardoso1/bhub-rss-aggregator.git"
fi

# 4. Fazer commit das mudanças (se houver)
log "Verificando mudanças não commitadas..."
if ! git diff --quiet; then
    log "Fazendo commit das mudanças..."
    git add .
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')" || true
    success "Mudanças commitadas"
fi

# 5. Push para o repositório
log "Fazendo push para o repositório..."
git push origin main || warning "Falha no push - verifique a conexão"

# 6. Criar arquivo de configuração PM2
log "Criando configuração PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bhub',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/bhub',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
success "Configuração PM2 criada"

# 7. Criar script de deploy no servidor
log "Criando script de deploy para o servidor..."
cat > deploy-server.sh << 'EOF'
#!/bin/bash

# Script para executar no servidor Hostinger
set -e

echo "🚀 Deploy no servidor iniciado..."

# Ir para o diretório do projeto
cd /var/www/bhub

# Fazer backup do banco (opcional)
echo "📦 Fazendo backup do banco de dados..."
pg_dump bhub_prod > backup_$(date +%Y%m%d_%H%M%S).sql || echo "Backup falhou - continuando..."

# Pull das mudanças
echo "📥 Baixando mudanças do Git..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Executar migrações do banco
echo "🗄️ Executando migrações do banco..."
npx prisma db push || echo "Migrações falharam - verificar manualmente"

# Build da aplicação
echo "🔨 Criando build de produção..."
npm run build

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart bhub

# Verificar status
echo "📊 Status da aplicação:"
pm2 status

echo "✅ Deploy concluído com sucesso!"
EOF

chmod +x deploy-server.sh
success "Script de deploy do servidor criado"

# 8. Criar arquivo de configuração Nginx
log "Criando configuração Nginx..."
cat > nginx-bhub.conf << 'EOF'
server {
    listen 80;
    server_name bhub.online www.bhub.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bhub.online www.bhub.online;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/bhub.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bhub.online/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Proxy para Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache para assets estáticos
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
success "Configuração Nginx criada"

# 9. Criar checklist de deploy
log "Criando checklist de deploy..."
cat > CHECKLIST_DEPLOY.md << 'EOF'
# ✅ Checklist de Deploy - bhub.online

## 📋 Pré-Deploy
- [ ] ✅ Build de produção criado
- [ ] ✅ Variáveis de ambiente configuradas (.env.production)
- [ ] ✅ Repositório Git atualizado
- [ ] ✅ Scripts de deploy criados

## 🖥️ No Servidor Hostinger

### 1. Configuração Inicial
- [ ] ✅ Acesso SSH ao servidor
- [ ] ✅ Node.js 18+ instalado
- [ ] ✅ PM2 instalado globalmente
- [ ] ✅ PostgreSQL instalado e configurado
- [ ] ✅ Nginx instalado

### 2. Upload dos Arquivos
- [ ] ✅ Projeto clonado em /var/www/bhub
- [ ] ✅ Dependências instaladas (npm install)
- [ ] ✅ Arquivo .env.production configurado
- [ ] ✅ ecosystem.config.js copiado

### 3. Banco de Dados
- [ ] ✅ Banco bhub_prod criado
- [ ] ✅ Usuário do banco configurado
- [ ] ✅ Migrações executadas (npx prisma db push)
- [ ] ✅ Seed executado (npx prisma db seed)

### 4. Aplicação
- [ ] ✅ Build criado (npm run build)
- [ ] ✅ PM2 configurado e iniciado
- [ ] ✅ Aplicação rodando na porta 3000

### 5. Nginx
- [ ] ✅ Configuração copiada para /etc/nginx/sites-available/
- [ ] ✅ Site ativado (symlink em sites-enabled)
- [ ] ✅ Configuração testada (nginx -t)
- [ ] ✅ Nginx reiniciado

### 6. SSL
- [ ] ✅ Certificado Let's Encrypt obtido
- [ ] ✅ Renovação automática configurada

### 7. Domínio
- [ ] ✅ DNS apontando para o servidor
- [ ] ✅ www.bhub.online configurado

## 🧪 Testes
- [ ] ✅ Site acessível via HTTPS
- [ ] ✅ Login funcionando
- [ ] ✅ Busca de artigos funcionando
- [ ] ✅ Painel admin acessível
- [ ] ✅ APIs respondendo corretamente

## 📊 Monitoramento
- [ ] ✅ PM2 monitorando aplicação
- [ ] ✅ Logs configurados
- [ ] ✅ Backup automático configurado

## 🎉 Deploy Concluído!
- [ ] ✅ Site online em https://bhub.online
- [ ] ✅ Todas as funcionalidades testadas
- [ ] ✅ Performance verificada
EOF
success "Checklist de deploy criado"

# 10. Resumo final
echo ""
echo "🎉 Preparação para deploy concluída!"
echo ""
echo "📁 Arquivos criados:"
echo "  - ecosystem.config.js (configuração PM2)"
echo "  - deploy-server.sh (script para o servidor)"
echo "  - nginx-bhub.conf (configuração Nginx)"
echo "  - CHECKLIST_DEPLOY.md (checklist completo)"
echo "  - DEPLOY_HOSTINGER.md (guia detalhado)"
echo ""
echo "📋 Próximos passos:"
echo "  1. Siga o guia em DEPLOY_HOSTINGER.md"
echo "  2. Use o checklist em CHECKLIST_DEPLOY.md"
echo "  3. Execute deploy-server.sh no servidor"
echo ""
echo "🔗 Links úteis:"
echo "  - Repositório: https://github.com/elissoncardoso1/bhub-rss-aggregator"
echo "  - Site: https://bhub.online (após deploy)"
echo ""
success "Tudo pronto para o deploy! 🚀"
