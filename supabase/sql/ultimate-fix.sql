-- ========================================================================================
-- O ULTIMATO: CORREÇÃO DEFINITIVA DA RECURSÃO (SEM AUTO-REFERÊNCIA)
-- ========================================================================================

-- O erro 42P17 "infinite recursion" em aircraft_owners aconteceu porque
-- a própria política tentava olhar para a tabela aircraft_owners. 
-- Regra de Ouro do Postgres: Uma política nunca deve fazer um SELECT na própria tabela!

-- 1. Limpar TODAS as políticas da tabela de donos (aircraft_owners)
DROP POLICY IF EXISTS "Ver donos: Mesma aeronave OU Admin/DOV" ON aircraft_owners;
DROP POLICY IF EXISTS "Ver donos" ON aircraft_owners;
DROP POLICY IF EXISTS "Owners can view their aircraft" ON aircraft_owners;
DROP POLICY IF EXISTS "Inserir cota" ON aircraft_owners;
DROP POLICY IF EXISTS "Deletar donos" ON aircraft_owners;

-- 2. Criar políticas simples, cegas e diretas (SEM SUBQUERIES RECURSIVAS)

-- LEITURA (SELECT): Você só pode ler os registros onde você mesmo é o dono.
CREATE POLICY "Ler donos"
ON aircraft_owners FOR SELECT
USING (owner_id = auth.uid());

-- INSERÇÃO (INSERT): Permite cadastrar um dono.
CREATE POLICY "Criar donos"
ON aircraft_owners FOR INSERT
WITH CHECK (true);

-- DELEÇÃO (DELETE): Permite excluir a relação (Lixeira).
CREATE POLICY "Excluir donos"
ON aircraft_owners FOR DELETE
USING (true);

-- ========================================================================================
-- EXTRA: Garantir as Empresas (Companies) também sem loops
-- ========================================================================================
DROP POLICY IF EXISTS "Usuários veem sua empresa" ON companies;
DROP POLICY IF EXISTS "Ler empresas" ON companies;

CREATE POLICY "Ler empresas limpo"
ON companies FOR SELECT
USING (true);

CREATE POLICY "Inserir empresas limpo"
ON companies FOR INSERT
WITH CHECK (true);
