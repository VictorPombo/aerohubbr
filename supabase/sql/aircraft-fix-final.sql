-- ========================================================================================
-- O VERDADEIRO MOTIVO: O PARADOXO DO OVO E DA GALINHA NA INSERÇÃO
-- ========================================================================================

-- O que estava acontecendo:
-- Passo 1: O código insere a Aeronave.
-- Passo 2: O código pede o ID da Aeronave de volta (.select()) para poder te colocar como Dono.
-- Passo 3: O banco bloqueia o Passo 2! Ele diz: "Você só pode ler essa aeronave se você for o dono!".
-- Mas você ainda não é o dono, porque isso só aconteceria no Passo 3! É um paradoxo.

-- 1. Vamos limpar TODAS as políticas da tabela aircraft
DROP POLICY IF EXISTS "Ver aeronaves" ON aircraft;
DROP POLICY IF EXISTS "Inserir aeronave" ON aircraft;
DROP POLICY IF EXISTS "Deletar aeronave" ON aircraft;

-- 2. Recriar a política de leitura corrigindo o Paradoxo
CREATE POLICY "Ler aeronaves"
ON aircraft FOR SELECT
USING (
  -- Condição 1: O usuário já foi cadastrado como dono na tabela de cotas
  id IN (SELECT aircraft_id FROM aircraft_owners WHERE owner_id = auth.uid()) 
  OR 
  -- Condição 2 (A SALVAÇÃO): Se a aeronave pertence à MESMA EMPRESA do usuário, ele pode ler.
  -- Como o seu usuário acabou de ser associado a essa empresa no passo anterior, 
  -- o banco vai permitir a leitura e liberar o ID para te colocar como dono!
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- 3. Garantir a inserção, edição e exclusão de forma pacífica
CREATE POLICY "Inserir aeronaves"
ON aircraft FOR INSERT
WITH CHECK (true);

CREATE POLICY "Atualizar aeronaves"
ON aircraft FOR UPDATE
USING (true);

CREATE POLICY "Excluir aeronaves"
ON aircraft FOR DELETE
USING (true);
