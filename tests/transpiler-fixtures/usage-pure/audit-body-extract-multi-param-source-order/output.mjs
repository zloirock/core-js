// two function params each carrying a polyfilled prop + rest sibling - both bail to
// body-extract. before the fix, each visit anchored at the directive-anchor's `insertAfter`,
// stacking subsequent extracts in REVERSE source order (`let keys` before `let from`).
// fix chains each new insert off the previous one so emitted `let from` / `let keys` follow
// source order, matching unplugin output byte-for-byte and the user's mental model
// NOTE: these functions are EXPORTED - external callers are invisible, so the call-site scan
// cannot prove the default always applies and the params stay VERBATIM; the body-extract
// behavior is covered by the immediately-invoked twin fixture
function run({
  from,
  ...rest1
} = Array, {
  keys,
  ...rest2
} = Object) {
  return [from([1]), keys({}), rest1, rest2];
}
export { run };