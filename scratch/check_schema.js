const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles table check:');
  console.log('Error:', error);
  console.log('Data:', data);
  
  const { data: d2, error: e2 } = await supabase.from('nonexistent_table').select('*').limit(1);
  console.log('Nonexistent table check:');
  console.log('Error:', e2);
}

checkSchema();
