import _Object$assign from "@core-js/pure/actual/object/assign";
// a destructuring assignment yields its right side, so a conditional receiver whose branch is
// replaced by a synth mirror hands the CAPTURED value that literal instead of the branch object.
// only the value-discarding statement form may mirror; every consuming position keeps the source
let a1, a2, a3, a4;
const shim = null;
const host1 = {
  assign: a1
} = shim || Object;
let host2;
host2 = {
  assign: a2
} = shim ? shim : Object;
export function reader() {
  return {
    assign: a3
  } = shim || Object;
}
({
  assign: a4
} = shim || {
  assign: _Object$assign
});
console.log(host1, host2, a1, a2, a3, a4);