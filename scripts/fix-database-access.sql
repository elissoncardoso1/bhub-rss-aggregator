-- Script para corrigir acesso ao banco de dados bhub_db
-- Execute este script como superusuário PostgreSQL

-- 1. Criar usuário se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'elissoncoimbra') THEN
        CREATE USER elissoncoimbra WITH PASSWORD 'password123';
    END IF;
END
$$;

-- 2. Dar privilégios de superusuário (para desenvolvimento)
ALTER USER elissoncoimbra WITH SUPERUSER;

-- 3. Dar acesso ao banco bhub_db
GRANT ALL PRIVILEGES ON DATABASE bhub_db TO elissoncoimbra;

-- 4. Conectar ao banco bhub_db e dar privilégios no schema public
\c bhub_db;

-- 5. Dar privilégios no schema public
GRANT ALL ON SCHEMA public TO elissoncoimbra;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO elissoncoimbra;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO elissoncoimbra;

-- 6. Configurar privilégios para tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO elissoncoimbra;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO elissoncoimbra;

-- 7. Verificar usuário atual
SELECT current_user, current_database();

-- 8. Listar usuários
\du
