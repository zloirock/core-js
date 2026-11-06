import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// NEGATIVE: a computed hop key cannot be walked - the chain is unresolvable
const {
  [k]: {
    [_Symbol$iterator]: viaComputed
  }
} = obj;
export { viaComputed };