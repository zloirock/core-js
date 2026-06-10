import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// two function params each carrying a polyfilled prop + rest sibling - both bail to
// body-extract. before the fix, each visit anchored at the directive-anchor's `insertAfter`,
// stacking subsequent extracts in REVERSE source order (`let keys` before `let from`).
// fix chains each new insert off the previous one so emitted `let from` / `let keys` follow
// source order, matching unplugin output byte-for-byte and the user's mental model
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({
  from: _unused,
  ...rest1
} = Array, {
  keys: _unused2,
  ...rest2
} = Object) {
  let from = _Array$from;
  let keys = _Object$keys;
  return [from([1]), keys({}), rest1, rest2];
})();