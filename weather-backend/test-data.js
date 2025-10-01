import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const insertTestData = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'weather_app',
    });

    console.log('🧪 Inserting test data...');

    // Insert test notes for Davao City
    const testNotes = [
      { city: 'Davao City', note: 'Beautiful city with great food and friendly people!' },
      { city: 'Davao City', note: 'Remember to visit the Davao River next time.' },
      { city: 'Manila City', note: 'Busy city with lots of traffic but great shopping.' },
      { city: 'Cebu City', note: 'Island paradise with amazing beaches.' }
    ];

    for (const noteData of testNotes) {
      await connection.execute(
        'INSERT INTO notes (city, note) VALUES (?, ?)',
        [noteData.city, noteData.note]
      );
      console.log(`✅ Inserted note for ${noteData.city}`);
    }

    console.log('🎉 Test data inserted successfully!');

    // Verify the data
    const [rows] = await connection.execute('SELECT * FROM notes ORDER BY city, created_at DESC');
    console.log('📋 Current notes in database:', rows);

  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};

insertTestData();