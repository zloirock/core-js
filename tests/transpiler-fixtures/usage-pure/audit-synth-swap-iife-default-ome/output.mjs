import _Array$from from "@core-js/pure/actual/array/from";
// IIFE default with OptionalMemberExpression (`{from} = globalThis?.Array`). synth-swap's
// `findTargetPath` previously rejected OME via the strict `isIdentifier || isMemberExpression`
// check, silently falling through to inline-default fallback even though the
// `isExpandedClassifiableReceiver` chain (via `globalProxyMemberName`) handles optional
// `?.` shapes for proxy globals
function f({
  from
} = {
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
f();