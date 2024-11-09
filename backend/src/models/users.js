export const storeUserDB = async (username, password, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, password]
  );
  client.release();
  return res.rows[0];
};

export const getUserInfoDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'SELECT id, username, password FROM users WHERE username = $1',
    [username]
  );
  client.release();
  return res.rows[0];
};
