import _globalThis from "@core-js/pure/actual/global-this";
// string-key `in` fold with a chain-assignment buried under the RHS member chain: the assignment
// is rescued whole (capturing the IIFE result), not double-run via a separate chain-root harvest
let calls = 0;
let captured;
const r = (captured = (() => {
  calls++;
  return _globalThis;
})(), true);