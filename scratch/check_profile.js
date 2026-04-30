const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// Use service role key if available, otherwise we test by logging in first
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminLogin() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@vaultix.com',
    password: 'Vaultix@123'
  });
  
  if (authErr) {
    console.error('Login Failed:', authErr.message);
    return;
  }
  
  console.log('Login Success. User ID:', authData.user.id);
  
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  if (profErr) {
    console.error('Profile Fetch Error:', profErr);
  } else {
    console.log('Profile found:', profile);
  }
}

checkAdminLogin();
