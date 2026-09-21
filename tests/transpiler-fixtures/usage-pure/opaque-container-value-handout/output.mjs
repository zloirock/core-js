import _Promise from "@core-js/pure/actual/promise";
// Passing the selected constructor to an unknown consumer exposes every static.
const source = [_Promise];
export function read(key) {
  return consume(source[key]);
}