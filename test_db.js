const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://zgvqhedezryopdxlpgmn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnFoZWRlenJ5b3BkeGxwZ21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDU2NywiZXhwIjoyMDkwNTAwNTY3fQ.tyM5OvcPltXBD83mlRKGxBD5xB9sg827_XGZlGkditY');

async function test() {
  const { data: p, error: e1 } = await supabase.from('pilots').select('*').limit(1);
  console.log('pilots:', p, e1?.message);
  
  const { data: sub, error: e2 } = await supabase.from('subscriptions').select('*').limit(1);
  console.log('subscriptions:', sub, e2?.message);
  
  const { data: prof, error: e3 } = await supabase.from('profiles').select('*').limit(1);
  console.log('profiles:', prof, e3?.message);
}
test();
