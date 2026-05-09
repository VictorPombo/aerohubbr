import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zgvqhedezryopdxlpgmn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnFoZWRlenJ5b3BkeGxwZ21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDU2NywiZXhwIjoyMDkwNTAwNTY3fQ.tyM5OvcPltXBD83mlRKGxBD5xB9sg827_XGZlGkditY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  // Let's just query a few common names
  const tables = ['users', 'profiles', 'accounts', 'partners'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Tabela ${table} falhou:`, error.message);
    } else {
      console.log(`Tabela ${table} existe!`);
    }
  }
}

checkTables().catch(console.error);
