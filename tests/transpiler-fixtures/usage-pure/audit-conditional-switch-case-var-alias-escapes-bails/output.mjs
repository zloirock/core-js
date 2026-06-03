import _globalThis from "@core-js/pure/actual/global-this";
// the guarding branch is a SWITCH case body (an array-valued branch field, so the SwitchCase node
// itself is recorded as the guard). the use sits outside the switch, so usage-pure bails
function f() {
  switch (x) {
    case 1:
      var M = _globalThis;
  }
  M.Array.from([1]);
}