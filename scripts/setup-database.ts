#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Script para configurar o banco de dados automaticamente
 */
async function setupDatabase() {
  console.log('🗄️  Configurando banco de dados para o projeto bhub...\n')

  try {
    // 1. Verificar se o PostgreSQL está rodando
    console.log('1️⃣ Verificando PostgreSQL...')
    try {
      execSync('psql --version', { stdio: 'pipe' })
      console.log('✅ PostgreSQL está disponível')
    } catch (error) {
      console.error('❌ PostgreSQL não está disponível. Instale com: brew install postgresql@14')
      return
    }

    // 2. Criar banco de dados
    console.log('\n2️⃣ Criando banco de dados...')
    try {
      execSync('createdb bhub_db', { stdio: 'pipe' })
      console.log('✅ Banco de dados "bhub_db" criado com sucesso')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Banco de dados "bhub_db" já existe')
      } else {
        console.log('⚠️  Erro ao criar banco (pode já existir):', error.message)
      }
    }

    // 3. Criar usuário se não existir
    console.log('\n3️⃣ Configurando usuário...')
    try {
      // Tenta conectar com o usuário atual
      execSync('psql -d bhub_db -c "SELECT current_user;"', { stdio: 'pipe' })
      console.log('✅ Usuário atual tem acesso ao banco')
    } catch (error) {
      console.log('⚠️  Usuário atual não tem acesso, tentando criar...')
      try {
        execSync('createuser --superuser $USER', { stdio: 'pipe' })
        console.log('✅ Usuário criado com privilégios de superusuário')
      } catch (createUserError: any) {
        console.log('⚠️  Erro ao criar usuário:', createUserError.message)
      }
    }

    // 4. Criar arquivo .env
    console.log('\n4️⃣ Criando arquivo .env...')
    const envPath = join(process.cwd(), '.env')
    
    if (existsSync(envPath)) {
      console.log('⚠️  Arquivo .env já existe')
    } else {
      const envContent = `# Database
DATABASE_URL="postgresql://${process.env.USER}@localhost:5432/bhub_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-$(date +%s)"

# Logging
LOG_LEVEL="debug"
LOG_FILE_PATH="./logs"

# Cache
CACHE_TTL_MS=1800000
CACHE_MAX_SIZE=500
`
      
      writeFileSync(envPath, envContent)
      console.log('✅ Arquivo .env criado com sucesso')
    }

    // 5. Gerar cliente Prisma
    console.log('\n5️⃣ Gerando cliente Prisma...')
    try {
      execSync('npm run db:generate', { stdio: 'pipe' })
      console.log('✅ Cliente Prisma gerado com sucesso')
    } catch (error) {
      console.log('⚠️  Erro ao gerar cliente Prisma:', error)
    }

    // 6. Aplicar schema ao banco
    console.log('\n6️⃣ Aplicando schema ao banco...')
    try {
      execSync('npm run db:push', { stdio: 'pipe' })
      console.log('✅ Schema aplicado ao banco com sucesso')
    } catch (error) {
      console.log('⚠️  Erro ao aplicar schema:', error)
    }

    console.log('\n🎉 Configuração do banco concluída!')
    console.log('\n🚀 Próximos passos:')
    console.log('   1. Execute: npm run db:seed-feeds (para adicionar os feeds)')
    console.log('   2. Execute: npm run db:sync (para sincronizar artigos)')
    console.log('   3. Execute: npm run test:ml (para testar o sistema ML)')

  } catch (error) {
    console.error('💥 Erro durante a configuração:', error)
  }
}

// Executa a configuração
setupDatabase()
