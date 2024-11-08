export const deleteRefreshTokenDB = async (hash, pool) => {
  const client = await pool.connect();
  await client.query('DELETE FROM tokens WHERE hash = $1'), [hash];
  client.release();
};

export const storeRefreshTokenDB = async (userID, hash, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "INSERT INTO tokens (user_id, hash, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
    [userID, hash]
  );
  console.log(res.rows[0]);
  client.release();
};

export const updateRefreshTokenDB = async (userID, hash, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "UPDATE tokens SET hash = $1, expires_at = NOW() + INTERVAL '30 days' WHERE user_id = $3",
    [hash, userID]
  );
  client.release();
  return res.rows[0];
};

export const storeUserDB = async (username, password, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, password]
  );
  console.log(res.rows[0]);
  client.release();
  return res.rows[0];
};

export const getUserInfoDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'SELECT id, username, password FROM users WHERE username = $1',
    [username]
  );
  console.log(res.rows[0]);
  client.release();
  return res.rows[0];
};

export const storeNoteDB = async (content, userID, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'INSERT INTO notes (content, user_id) VALUES ($1, $2) RETURNING *',
    [content, userID]
  );
  console.log(res.rows[0]);
  client.release();
};

export const deleteNoteDB = async (noteID, pool) => {
  const client = await pool.connect();
  await client.query('DELETE FROM notes WHERE id = $1', [noteID]);
  client.release();
};

export const getNotesAndRemoveOldDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'SELECT * FROM notes WHERE user_id = $1 ORDER BY id DESC',
    [username]
  );
  const twelveHoursAgo = new Date(Date.now() - 1000); // FOR TESTING
  // const twelveHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 12);
  const rowsToDeleteIDs = res.rows
    .filter((row) => row.created_at <= twelveHoursAgo)
    .map((row) => row.id);
  await client.query('DELETE FROM notes WHERE id = ANY($1)', [rowsToDeleteIDs]);
  client.release();
  return res.rows.filter((row) => row.created_at > twelveHoursAgo);
};
