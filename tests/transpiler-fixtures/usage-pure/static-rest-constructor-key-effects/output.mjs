import _Promise from "@core-js/pure/actual/promise";
// Receiver effects run once before keys while all properties come from the index.
const {
  [(hit(), "all")]: all,
  ...rest
} = (sourceEffect(), _Promise);
export { all, rest };