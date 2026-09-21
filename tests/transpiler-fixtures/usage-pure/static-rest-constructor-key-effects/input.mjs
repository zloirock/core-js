// Receiver effects run once before keys while all properties come from the index.
const { [(hit(), "all")]: all, ...rest } = (sourceEffect(), Promise);
export { all, rest };
