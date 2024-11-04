import pkg from 'pg';
const { Pool } = pkg;

const initDB = async () => {
  const psqlString = process.env.DATABASE_URL;
  if (!psqlString) {
    throw new Error('env DATABASE_URL is not set');
  }
  const pool = new Pool({
    connectionString: psqlString,
  });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables', err);
    throw err;
  }
  return pool;
};

export default initDB;
