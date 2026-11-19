import _globalThis from "@core-js/pure/actual/global-this";
// An IIFE beneath a stored receiver executes its setup once before the member read.
// The literal wrapper stays native and preserves the stored realm.
let calls = 0;
let a;
const [{
  from
}] = [(a = (() => {
  calls++;
  return _globalThis;
})()).Array];