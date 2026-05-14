-- ========================================================================================
-- RECUPERAÇÃO DE PERFIS PERDIDOS (FOREIGN KEY ERROR FIX)
-- ========================================================================================

-- O erro de constraint role_check ocorreu porque a tabela só aceita
-- os cargos: 'admin', 'dov', 'pilot', 'mechanic', 'owner'.
-- O script anterior tentou inserir 'user', que não é permitido.

-- Vamos inserir os perfis faltantes corretamente com o cargo 'pilot' por padrão.

INSERT INTO public.profiles (id, full_name, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Usuário ' || substr(id::text, 1, 4)), 
  'pilot'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Fim!
