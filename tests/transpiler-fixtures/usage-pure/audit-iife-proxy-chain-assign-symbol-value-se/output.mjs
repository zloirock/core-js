import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// IIFE-rooted proxy receiver captured by a chain assignment (`(a = IIFE()).Symbol.iterator`):
// the assignment is preserved whole (capturing the IIFE result) while the member collapses to the
// symbol import; the member hop above the assignment must be marked or its rewrite overlaps
let calls = 0;
let captured;
const it = (captured = (() => {
  calls++;
  return _globalThis;
})(), _Symbol$iterator);