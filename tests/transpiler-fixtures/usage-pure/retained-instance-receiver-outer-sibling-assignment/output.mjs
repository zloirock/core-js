import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A nested instance assignment retains the receiver between its outer siblings.
// The nested dispatch precedes the following sibling's native read.
const host = {
  m: [1, [2]],
  x: 1
};
let at, x;
at = _atMaybeArray(host.m);
({
  x
} = host);
console.log(at, x);