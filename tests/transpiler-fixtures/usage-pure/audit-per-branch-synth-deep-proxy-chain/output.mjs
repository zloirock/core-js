import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// both fallback branches use deep proxy chains (`globalThis.self.Array`,
// `self.window.Array`). intermediate identifiers must NOT queue parallel polyfill
// transforms that would conflict with the synth-swap receiver-span overwrite
function f({
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Array$from
}) {
  return from([1]);
}
function g({
  of
} = cond ? {
  of: _Array$of
} : {
  of: _Array$of
}) {
  return of(7, 8);
}
export { f, g };