import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual parsing of .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(email, password) {
  console.log(`Criando usuário ${email}...`);
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already') || authError.code === 'email_exists') {
      console.log(`Usuário ${email} já existe no Auth.`);
    } else {
      console.error(`Erro ao criar usuário ${email}:`, authError);
    }
  } else {
    console.log(`Usuário ${email} criado com sucesso! ID:`, authData.user.id);
  }
}

async function main() {
  await createUser('admin@aerogest.com', '123456');
  await createUser('saraiva@aerogest.com', 'teste123');
}

main().catch(console.error);
