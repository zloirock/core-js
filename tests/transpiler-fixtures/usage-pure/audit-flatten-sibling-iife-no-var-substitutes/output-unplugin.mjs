import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// negative control: NO var-shadow on `globalThis`, just a sibling IIFE that references
// it. Identifier visitor SHOULD substitute `globalThis` -> `_globalThis` inside the IIFE.
// confirms the var-walk fallback is gated correctly (only fires when shadow exists)
const from = _Array$from;
const val = (function () {
  return _Symbol;
})();
console.log(from, val);