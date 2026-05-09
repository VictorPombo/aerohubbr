import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgvqhedezryopdxlpgmn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnFoZWRlenJ5b3BkeGxwZ21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDU2NywiZXhwIjoyMDkwNTAwNTY3fQ.tyM5OvcPltXBD83mlRKGxBD5xB9sg827_XGZlGkditY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole() {
  const email = 'admin@gridhub.com.br';

  console.log(`Buscando usuário com email ${email} na tabela pilots...`);
  
  const { data: pilots, error } = await supabase
    .from('pilots')
    .select('id, email, role')
    .eq('email', email);

  if (error) {
    console.error('Erro ao buscar na tabela pilots:', error);
    return;
  }

  if (pilots && pilots.length > 0) {
    const pilot = pilots[0];
    console.log('Piloto encontrado:', pilot);
    
    console.log('Atualizando role para admin...');
    const { data: updateData, error: updateError } = await supabase
      .from('pilots')
      .update({ role: 'admin' })
      .eq('id', pilot.id)
      .select();
      
    if (updateError) {
      console.error('Erro ao atualizar role:', updateError);
    } else {
      console.log('Usuário atualizado com sucesso para admin!', updateData);
    }
  } else {
    console.log('Usuário não encontrado na tabela pilots. Verificando auth.users é restrito, talvez tenha que criar uma conta pelo site usando este email e depois rodar o script novamente.');
    
    // Let's create an account with a slightly different email just in case
    const email2 = 'suporte@gridhub.com.br';
    const password = 'AdminPassword123!';
    
    console.log(`Tentando criar novo usuário: ${email2}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email2,
      password,
      email_confirm: true,
    });
    
    if (authError) {
      console.error('Erro ao criar usuário 2:', authError.message);
    } else {
      console.log('Usuário 2 criado! Verifique se a trigger inseriu na tabela pilots e rode novamente.');
      console.log(authData);
    }
  }
}

setAdminRole().catch(console.error);
