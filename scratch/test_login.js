const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@vaultix.com',
    password: 'Vaultix@123'
  });
  
  if (error) {
    console.error('Login Error:', error.message);
  } else {
    console.log('Login Success:', data.user.email);
  }
}

testLogin();
