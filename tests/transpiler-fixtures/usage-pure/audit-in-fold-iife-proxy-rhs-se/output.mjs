import _globalThis from "@core-js/pure/actual/global-this";
// string-key `in` fold with an IIFE-rooted proxy RHS chain: the fold discards the chain but the
// IIFE setup is harvested and re-prepended, keeping its inner globalThis rewrite + import
let calls = 0;
const r = ((() => {
  calls++;
  return _globalThis;
})(), true);