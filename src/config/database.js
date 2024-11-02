import pkg from "pg";
const { Pool } = pkg;

const initDB = async () => {
  const psqlString = process.env.DATABASE_URL;
  if (!psqlString) {
    throw new Error("env DATABASE_URL is not set");
  }
  const pool = new Pool({
    connectionString: psqlString,
  });
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT,
        password TEXT
      );

    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        context TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables", err);
    throw err;
  }
  return pool;
};

export default initDB;
