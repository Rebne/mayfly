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
  const twelveHoursAgo = new Date(Date.now() - 1);
  const rowsToDeleteIDs = res.rows
    .filter((row) => row.created_at <= twelveHoursAgo)
    .map((row) => row.id);
  await client.query("DELETE FROM notes WHERE id = ANY($1)", [rowsToDeleteIDs]);

  client.release();
  return res.rows;
};

export const deleteExpiredNotes = async (userID, pool) => {
  try {
    const client = await pool.connect();
    // const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const rows = await client.query(
      "SELECT * FROM notes WHERE user_id = $1 AND created_at <= $2",
      [userID, twelveHoursAgo]
    );

    if (rows.length > 0) {
      const rowIDs = rows.map((row) => row.id);
      await client.query("DELETE FROM notes WHERE id = ANY($1)", [rowIDs]);
    }
    client.release();
  } catch (error) {
    throw error;
  }
};
