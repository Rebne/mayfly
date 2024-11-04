export const middlewareLogger = (req, _, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
};
