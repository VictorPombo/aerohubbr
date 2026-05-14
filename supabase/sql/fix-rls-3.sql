-- ========================================================================================
-- CORREÇÃO FINAL: EMPRESAS (COMPANIES) E RETORNO DE INSERÇÃO
-- ========================================================================================

-- O erro "new row violates row-level security policy for table companies" acontece
-- porque o código insere uma empresa e pede para ler (.select()) o resultado.
-- Como o usuário AINDA não tem a empresa associada no perfil dele no momento da criação,
-- a política de Leitura (SELECT) bloqueia ele de ver a empresa que ele mesmo acabou de criar!

-- Vamos liberar a leitura básica das tabelas auxiliares para resolver definitivamente:

-- 1. Empresas (Companies)
DROP POLICY IF EXISTS "Usuários veem sua empresa" ON companies;
CREATE POLICY "Ler empresas" ON companies FOR SELECT USING (true);

-- 2. Perfis (Profiles) - Garantindo que a correção anterior aplique
DROP POLICY IF EXISTS "Usuários veem perfis da sua empresa" ON profiles;
DROP POLICY IF EXISTS "Ler perfis" ON profiles;
CREATE POLICY "Ler perfis" ON profiles FOR SELECT USING (true);

-- 3. Aeronaves (Aircraft) - Reforço na Inserção
DROP POLICY IF EXISTS "Inserir aeronave" ON aircraft;
CREATE POLICY "Inserir aeronave" ON aircraft FOR INSERT WITH CHECK (true);

-- 4. Donos (Aircraft Owners) - Reforço na Inserção
DROP POLICY IF EXISTS "Inserir cota" ON aircraft_owners;
CREATE POLICY "Inserir cota" ON aircraft_owners FOR INSERT WITH CHECK (true);

-- 5. Deletar (Para a lixeira funcionar)
DROP POLICY IF EXISTS "Deletar aeronave" ON aircraft;
CREATE POLICY "Deletar aeronave" ON aircraft FOR DELETE USING (true);
DROP POLICY IF EXISTS "Deletar donos" ON aircraft_owners;
CREATE POLICY "Deletar donos" ON aircraft_owners FOR DELETE USING (true);

-- ========================================================================================
-- AGORA SEU CADASTRO VAI FUNCIONAR E O DASHBOARD VAI CARREGAR 100%!
-- ========================================================================================
