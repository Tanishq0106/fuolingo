import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uetsffgopygchakgvhdz.supabase.co';
const supabaseKey = 'sb_publishable_9_Yrtx2tg9Qp-ZInU8GgIw_UIXMGaWJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.log('Query result error:', error.message, error.code, error.details);
    } else {
      console.log('Successfully queried profiles table! Rows:', data);
    }
  } catch (err) {
    console.error('Exception connecting to Supabase:', err.message);
  }
}

testConnection();
