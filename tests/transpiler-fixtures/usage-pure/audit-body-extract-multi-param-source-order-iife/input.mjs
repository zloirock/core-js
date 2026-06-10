// two function params each carrying a polyfilled prop + rest sibling - both bail to
// body-extract. before the fix, each visit anchored at the directive-anchor's `insertAfter`,
// stacking subsequent extracts in REVERSE source order (`let keys` before `let from`).
// fix chains each new insert off the previous one so emitted `let from` / `let keys` follow
// source order, matching unplugin output byte-for-byte and the user's mental model
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({ from, ...rest1 } = Array, { keys, ...rest2 } = Object) {
  return [from([1]), keys({}), rest1, rest2];
})();
