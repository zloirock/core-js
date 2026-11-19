// Constructor rest requires the full family without changing source or key effects.
const { [(hit(), "all")]: all, ...rest } = (sourceEffect(), Promise);
export { all, rest };
