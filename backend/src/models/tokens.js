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
  client.release();
};

export const updateRefreshTokenDB = async (userID, hash, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "UPDATE tokens SET hash = $1, expires_at = NOW() + INTERVAL '30 days' WHERE user_id = $2",
    [hash, userID]
  );
  client.release();
  return res.rows[0];
};
