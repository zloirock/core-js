import _Promise from "@core-js/pure/actual/promise/constructor";
// three function params each with a polyfilled prop + rest sibling, three distinct
// constructors (Array.from, Object.keys, Promise.resolve) so imports identify each.
// EXPORTED, so external callers are invisible: the call-site scan can't prove the default
// always applies, params stay VERBATIM (body-extract is locked by the immediately-invoked twin)
function f({
  from,
  ...r1
} = Array, {
  keys,
  ...r2
} = Object, {
  resolve,
  ...r3
} = _Promise) {
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
}
export { f };