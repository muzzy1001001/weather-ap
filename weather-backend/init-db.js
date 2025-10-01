import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const initDb = async () => {
  let connection;
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS weather_app');
    await connection.query('USE weather_app');

    // Create tables
    const schema = fs.readFileSync('schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✅ Database and tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};

initDb();