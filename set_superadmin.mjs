import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgvqhedezryopdxlpgmn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnFoZWRlenJ5b3BkeGxwZ21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDU2NywiZXhwIjoyMDkwNTAwNTY3fQ.tyM5OvcPltXBD83mlRKGxBD5xB9sg827_XGZlGkditY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setSuperAdmin() {
  const email = 'admin@gridhub.com.br';

  console.log('Buscando ID do usuário na tabela pilots...');
  const { data: pilots, error: dbError } = await supabase.from('pilots').select('id').eq('email', email);
  
  if (dbError || !pilots || pilots.length === 0) {
    console.error('Usuário não encontrado na tabela pilots ou erro:', dbError);
    return;
  }
  
  const userId = pilots[0].id;
  console.log('Usuário encontrado, ID:', userId);

  console.log('Atualizando user_metadata no Auth...');
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: 'super_admin' } }
  );

  if (updateError) {
    console.error('Erro ao atualizar metadata:', updateError);
  } else {
    console.log('Metadata atualizado com sucesso! Agora tem permissão de super_admin.');
  }
}

setSuperAdmin().catch(console.error);
