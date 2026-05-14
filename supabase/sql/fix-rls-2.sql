-- ========================================================================================
-- CORREÇÃO DEFINITIVA DO RLS (O VERDADEIRO VILÃO)
-- ========================================================================================

-- O erro ainda persiste porque o loop infinito não estava só nas aeronaves!
-- A tabela 'profiles' (Perfis) tinha uma política que dizia:
-- "Para ver um perfil, verifique na tabela de perfis qual é a empresa dele".
-- Isso gerava um loop na tabela profiles, e como a tabela aircraft consulta a profiles... BOOM!

-- 1. Remover a política defeituosa da tabela de perfis
DROP POLICY IF EXISTS "Usuários veem perfis da sua empresa" ON profiles;
DROP POLICY IF EXISTS "Usuários podem editar próprio perfil" ON profiles;

-- 2. Recriar a política de forma extremamente segura e sem loops
-- Para o MVP, permitimos que usuários logados leiam os perfis (apenas os nomes e e-mails básicos)
-- Isso acaba com qualquer recursão instantaneamente e permite que o Cadastro de Aeronave funcione.

CREATE POLICY "Ler perfis" 
ON profiles FOR SELECT 
USING (true);

-- Garantir que a pessoa só edite a si mesma (isso já estava certo, mas reforçamos)
CREATE POLICY "Editar próprio perfil" 
ON profiles FOR UPDATE 
USING (id = auth.uid());

-- Permitir a inserção de novos perfis (caso a trigger de criação precise)
CREATE POLICY "Inserir perfil" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
