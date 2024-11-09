export const middlewareLogger = (req, _, next) => {
  const now = new Date().toISOString();
  const [date, time] = now.split('T');
  const timeWithoutMs = time.split('.')[0];
  console.log(
    `[${date} ${timeWithoutMs}] ${req.method} request for ${req.url}`
  );
  next();
};
