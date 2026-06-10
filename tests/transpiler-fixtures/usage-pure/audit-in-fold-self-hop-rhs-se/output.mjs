import _globalThis from "@core-js/pure/actual/global-this";
// string-key `in` fold with an intermediate `.self` hop in the discarded RHS chain. Node-based
// runtime oracles can't execute `self`, so this spelling is locked here at text level
let calls = 0;
const r = ((() => {
  calls++;
  return _globalThis;
})(), true);