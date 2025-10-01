import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const insertTestData = async () => {
  try {
    console.log('🧪 Inserting test data...');

    // Insert test notes
    const testNotes = [
      { city: 'Davao City', note: 'Beautiful city with great food and friendly people!' },
      { city: 'Davao City', note: 'Remember to visit the Davao River next time.' },
      { city: 'Manila City', note: 'Busy city with lots of traffic but great shopping.' },
      { city: 'Cebu City', note: 'Island paradise with amazing beaches.' }
    ];

    const { error } = await supabase.from('notes').insert(testNotes);
    if (error) throw error;

    console.log('🎉 Test data inserted successfully!');

    // Verify the data
    const { data, error: fetchError } = await supabase.from('notes').select('*').order('city').order('created_at', { ascending: false });
    if (fetchError) throw fetchError;
    console.log('📋 Current notes in database:', data);

  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  }
};

insertTestData();