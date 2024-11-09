export const storeNoteDB = async (content, userID, pool) => {
  const client = await pool.connect();
  const res = await client.query(
    'INSERT INTO notes (content, user_id) VALUES ($1, $2) RETURNING *',
    [content, userID]
  );
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
  const twelveHoursAgo = new Date(Date.now() - 3 * 60 * 1000); // FOR TESTING
  // const twelveHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 12);
  const rowsToDeleteIDs = res.rows
    .filter((row) => row.created_at <= twelveHoursAgo)
    .map((row) => row.id);
  await client.query('DELETE FROM notes WHERE id = ANY($1)', [rowsToDeleteIDs]);
  client.release();
  return res.rows.filter((row) => row.created_at > twelveHoursAgo);
};
