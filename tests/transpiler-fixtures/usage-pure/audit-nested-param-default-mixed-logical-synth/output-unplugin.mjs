import _Array$from from "@core-js/pure/actual/array/from";
// MIXED operators (`(m && globalThis) || self`): `m` selects at runtime, so BOTH reachable
// value leaves unfold into the mirrored literal - the guarded left when m is truthy, the
// fallback right when it is falsy. the `&&` left itself keeps selecting natively
let m;
function f({ Array: { from } } = (m && { Array: { from: _Array$from } }) || { Array: { from: _Array$from } }) {
  return from;
}
export { f };