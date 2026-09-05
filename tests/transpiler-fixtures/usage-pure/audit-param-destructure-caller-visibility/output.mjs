import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed,
// and an inline default fills a leaf the caller deliberately left undefined. That is sound only
// where every call site is visible. The two immediately-invoked hosts below are rewritten; every
// other host keeps its parameters verbatim and is served by global injection instead.
// The pattern is the same in all seven rows, so the host is the only variable; the two invoked
// rows differ only in body shape, which is what picks the inline default over the hoisted binding.
const G = _globalThis;
export const iifeArrow = (([{
  Set = _Set,
  Array: {
    from = _Array$from
  }
} = G]) => [Set, from])([]);
export const iifeBlockBody = (([{
  Array: {
    of = _Array$of
  }
} = G]) => {
  let Map = _Map;
  return [Map, of];
})([]);
export function exportedDeclaration([{
  WeakSet,
  Array: {
    from
  }
} = G]) {
  return [WeakSet, from];
}
function localDeclaration([{
  WeakMap,
  Array: {
    of
  }
} = G]) {
  return [WeakMap, of];
}
export const exportedArrow = ([{
  Promise,
  Array: {
    from
  }
} = G]) => [Promise, from];
const assignedThenCalled = ([{
  Set: S,
  Array: {
    of: o
  }
} = G]) => [S, o];
export const objectMethod = {
  m([{
    Map: M,
    Array: {
      from: f
    }
  } = G]) {
    return [M, f];
  }
};
export const called = assignedThenCalled([]);
export { localDeclaration };