export const insertNoteDB = async (content, userID, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    "INSERT INTO notes (content, user_id) VALUES ($1, $2) RETURNING *",
    [content, userID]
  );
  console.log(res.rows[0]);
  client.release();
};

export const deleteNoteDB = async (noteID, pool) => {
  const client = await pool.connect();
  await client.query("DELETE FROM notes WHERE id = $1", [noteID]);
  client.release();
};

export const getNotesAndRemoveOldDB = async (username, pool) => {
  const client = await pool.connect();
  const res = await client.query("SELECT * FROM notes WHERE user_id = $1", [
    username,
  ]);
  const twelveHoursAgo = new Date(Date.now() - 1000);
  // const twelveHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 12);
  const rowsToDeleteIDs = res.rows
    .filter((row) => row.created_at <= twelveHoursAgo)
    .map((row) => row.id);
  await client.query("DELETE FROM notes WHERE id = ANY($1)", [rowsToDeleteIDs]);
  client.release();
  return res.rows;
};
