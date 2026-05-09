import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgvqhedezryopdxlpgmn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnFoZWRlenJ5b3BkeGxwZ21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDU2NywiZXhwIjoyMDkwNTAwNTY3fQ.tyM5OvcPltXBD83mlRKGxBD5xB9sg827_XGZlGkditY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@gridhub.com.br';
  const password = 'AdminPassword123!';

  console.log('Criando usuário de administrador no Auth...');
  
  // Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already') || authError.code === 'email_exists') {
      console.log('Usuário já existe no Auth. Pegando ID...');
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.error('Erro ao listar usuários:', usersError);
        return;
      }
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        await upsertPilot(existingUser.id, email);
      } else {
        console.log('Não foi possível encontrar o usuário existente.');
      }
    } else {
      console.error('Erro ao criar usuário:', authError);
    }
    return;
  }

  console.log('Usuário criado no Auth com sucesso!', authData.user.id);
  await upsertPilot(authData.user.id, email);
}

async function upsertPilot(id, email) {
  console.log('Criando/Atualizando usuário na tabela pilots...');
  
  const { data, error } = await supabase
    .from('pilots')
    .upsert({
      id: id,
      email: email,
      display_name: 'Admin GridHub',
      role: 'admin',
      is_public: false,
      tier: 'elite',
      category: 'am'
    })
    .select();

  if (error) {
    console.error('Upsert na tabela pilots falhou:', error);
  } else {
    console.log('Usuário administrador inserido/atualizado na tabela pilots com sucesso!', data);
  }
}

createAdmin().catch(console.error);
