# 🚀 Guia de Deploy para Hostinger - bhub.online

## 📋 Pré-requisitos

### 1. **Conta Hostinger**
- ✅ Conta ativa no Hostinger
- ✅ Domínio `bhub.online` configurado
- ✅ Plano VPS ou Cloud Hosting (recomendado)

### 2. **Banco de Dados**
- ✅ PostgreSQL configurado no Hostinger
- ✅ Credenciais de acesso ao banco

## 🔧 Configuração do Servidor

### 1. **Acesso SSH ao VPS**
```bash
ssh root@seu-ip-do-vps
```

### 2. **Instalar Node.js 18+**
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. **Instalar PM2 (Process Manager)**
```bash
npm install -g pm2
```

### 4. **Instalar PostgreSQL (se não estiver instalado)**
```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
```

## 📁 Upload dos Arquivos

### 1. **Criar diretório do projeto**
```bash
mkdir -p /var/www/bhub
cd /var/www/bhub
```

### 2. **Upload via Git (Recomendado)**
```bash
# Instalar Git
apt install git -y

# Clonar repositório
git clone https://github.com/elissoncardoso1/bhub-rss-aggregator.git .

# Instalar dependências
npm install
```

### 3. **Upload via FTP/SFTP (Alternativo)**
- Use FileZilla ou similar
- Upload da pasta `.next` (build de produção)
- Upload de `package.json`, `next.config.js`, etc.

## ⚙️ Configuração de Ambiente

### 1. **Criar arquivo .env.production**
```bash
nano .env.production
```

### 2. **Conteúdo do .env.production**
```env
# Ambiente
NODE_ENV=production

# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/bhub_prod"

# NextAuth (CRÍTICO)
NEXTAUTH_URL="https://bhub.online"
NEXTAUTH_SECRET="sua-chave-super-secreta-32-caracteres-minimo"

# APIs Externas
HUGGINGFACE_API_KEY="sua-chave-huggingface"
UNSPLASH_ACCESS_KEY="sua-chave-unsplash"

# Monitoramento
SENTRY_DSN="sua-dsn-sentry"
NEXT_PUBLIC_SENTRY_DSN="sua-dsn-publica-sentry"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_BLOCK_DURATION=300000

# Logs
LOG_LEVEL="warn"
LOG_FILE_PATH="./logs"
LOG_MAX_SIZE=5242880
LOG_MAX_FILES=5

# Cache
CACHE_TTL_MS=1800000
CACHE_MAX_SIZE=500

# Segurança
ENABLE_HTTPS_REDIRECT=true
ENABLE_SECURITY_HEADERS=true
ENABLE_RATE_LIMITING=true

# Performance
ENABLE_COMPRESSION=true
ENABLE_IMAGE_OPTIMIZATION=true
MAX_IMAGE_SIZE=5242880

# Backup
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
DATA_RETENTION_DAYS=365

# 🔴 NÃO exibir credenciais em produção
SHOW_DEMO_CREDENTIALS=false
```

### 3. **Gerar NEXTAUTH_SECRET seguro**
```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🗄️ Configuração do Banco de Dados

### 1. **Criar banco de dados**
```bash
sudo -u postgres psql
```

### 2. **Comandos SQL**
```sql
-- Criar usuário
CREATE USER bhub_user WITH PASSWORD 'sua_senha_segura';

-- Criar banco
CREATE DATABASE bhub_prod OWNER bhub_user;

-- Dar privilégios
GRANT ALL PRIVILEGES ON DATABASE bhub_prod TO bhub_user;

-- Sair
\q
```

### 3. **Executar migrações**
```bash
# No diretório do projeto
npx prisma db push
npx prisma db seed
```

## 🚀 Deploy da Aplicação

### 1. **Criar arquivo ecosystem.config.js**
```bash
nano ecosystem.config.js
```

### 2. **Conteúdo do ecosystem.config.js**
```javascript
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
```

### 3. **Iniciar aplicação com PM2**
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

## 🌐 Configuração do Nginx

### 1. **Instalar Nginx**
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

### 2. **Criar configuração do site**
```bash
nano /etc/nginx/sites-available/bhub.online
```

### 3. **Conteúdo da configuração Nginx**
```nginx
server {
    listen 80;
    server_name bhub.online www.bhub.online;
    
    # Redirecionar HTTP para HTTPS
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
```

### 4. **Ativar site**
```bash
ln -s /etc/nginx/sites-available/bhub.online /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 Configuração SSL (Let's Encrypt)

### 1. **Instalar Certbot**
```bash
apt install certbot python3-certbot-nginx -y
```

### 2. **Obter certificado SSL**
```bash
certbot --nginx -d bhub.online -d www.bhub.online
```

### 3. **Configurar renovação automática**
```bash
crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoramento

### 1. **Verificar status da aplicação**
```bash
pm2 status
pm2 logs bhub
```

### 2. **Verificar logs do Nginx**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. **Verificar uso de recursos**
```bash
htop
df -h
free -h
```

## 🔄 Atualizações

### 1. **Deploy de atualizações**
```bash
cd /var/www/bhub
git pull origin main
npm install
npm run build
pm2 restart bhub
```

### 2. **Rollback (se necessário)**
```bash
git log --oneline
git checkout <commit-hash>
npm run build
pm2 restart bhub
```

## 🛠️ Comandos Úteis

### PM2
```bash
pm2 status          # Status das aplicações
pm2 logs bhub       # Ver logs
pm2 restart bhub    # Reiniciar aplicação
pm2 stop bhub       # Parar aplicação
pm2 delete bhub     # Remover aplicação
```

### Nginx
```bash
nginx -t            # Testar configuração
systemctl reload nginx  # Recarregar configuração
systemctl restart nginx # Reiniciar Nginx
```

### Banco de Dados
```bash
sudo -u postgres psql -d bhub_prod  # Conectar ao banco
npx prisma studio                    # Interface visual do banco
```

## ✅ Checklist Final

- [ ] ✅ Build de produção criado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Banco de dados configurado
- [ ] ✅ Aplicação rodando com PM2
- [ ] ✅ Nginx configurado e funcionando
- [ ] ✅ SSL configurado
- [ ] ✅ Domínio apontando para o servidor
- [ ] ✅ Testes de funcionalidade realizados

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs: `pm2 logs bhub`
2. Verificar status: `pm2 status`
3. Verificar Nginx: `nginx -t`
4. Verificar banco: `sudo -u postgres psql -d bhub_prod`

**🎉 Seu site bhub.online estará online!**
