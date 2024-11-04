export const insertUsernameDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "INSERT INTO users (username) VALUES ($1) RETURNING *",
    [username],
  );
  console.log(res.rows[0]);
  client.release();
};

export const getNotesAndRemoveOldDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query("SELECT * FROM notes WHERE user_id = $1", [
    username,
  ]);
  const twelveHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 12);
  const rowsToDeleteIDs = res.rows
    .filter((row) => row.created_at <= twelveHoursAgo)
    .map((row) => row.id);
  await client.query("DELETE FROM notes WHERE id = ANY($1)", [rowsToDeleteIDs]);
  client.release();
  return res.rows;
};
