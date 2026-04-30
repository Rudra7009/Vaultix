const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSeeded() {
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  console.log('Profiles found:', data.length);
  console.log('Sample profiles:', data);
  
  const { data: assets, error: assetError } = await supabase.from('assets').select('*').limit(5);
  if (assetError) {
    console.error('Error fetching assets:', assetError);
  } else {
    console.log('Assets found:', assets.length);
  }
}

checkSeeded();
