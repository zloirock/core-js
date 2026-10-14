import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
// A local helper proven to return a constructor serves the static read off its result beside a rest: the
// claim writes ahead, and the residual keeps the call, the sibling and the rest's copy.
let f6, c6, r6;
function mkA() {
  return Array;
}
var _unused;
f6 = _Array$fromAsync;
({
  fromAsync: _unused,
  custom: c6,
  ...r6
} = mkA());