export const insertUsername = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "INSERT INTO users (username) VALUES ($1) RETURNING *",
    [username]
  );
  console.log(res.rows[0]);
  client.release();
};

export const getNotes = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query("SELECT * FROM notes WHERE user_id = $1", [
    username,
  ]);
  client.release();
  return res.rows;
};
