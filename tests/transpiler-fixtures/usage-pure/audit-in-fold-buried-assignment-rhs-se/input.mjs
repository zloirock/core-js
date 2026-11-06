// string-key `in` fold with a chain-assignment buried under the RHS member chain: the assignment
// is rescued whole (capturing the IIFE result), not double-run via a separate chain-root harvest
let calls = 0;
let captured;
const r = 'from' in (captured = (() => {
  calls++;
  return globalThis;
})()).Array;
