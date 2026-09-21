import _Promise from "@core-js/pure/actual/promise";
// A constructor alias and every reference to its name use one index in this file.
const Source = _Promise;
const {
  resolve,
  ...rest
} = Source;
const same = Source === _Promise;
export { resolve, rest, same };