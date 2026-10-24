import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
let k = 0;
// a user-written sequence stays put - only plugin-built wrappers lift into the guard
export function readName(x) {
  return _nameMaybeFunction((k++, x));
}