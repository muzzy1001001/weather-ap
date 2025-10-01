import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY; // Use service role for schema changes if available

const supabase = createClient(supabaseUrl, supabaseKey);

const initDb = async () => {
  try {
    // Note: For Supabase, tables are typically created via the dashboard SQL editor or migrations.
    // This script is for reference. Run the schema.sql in Supabase dashboard.
    console.log('ℹ️  For Supabase, please run the schema.sql in the Supabase dashboard SQL editor to create tables.');
    console.log('✅ Initialization check complete. Ensure tables exist in Supabase.');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
};

initDb();