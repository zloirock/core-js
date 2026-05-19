import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructure-pattern parameter: `function f({a, b}) { return a; }`. babel sets
// `binding.path.node` to the param's ObjectPattern container (not the inner
// Identifier), so identity equality conflated direct vs destructured params and
// `resolveNodeType(args[0])` returned the outer object type instead of the
// destructured slot. `resolveParamType` now dispatches by param SHAPE: direct
// named param matches by name; pattern params walk `findPatternKeyPath` to
// locate the binding's key path, then project from the call arg via
// `resolveDestructuredMember`. without this branch the body fold returns the
// wrong type for `a` and `.at(-1)` on the result dispatches the generic polyfill
function f({
  a,
  b
}) {
  return a;
}
const x = f({
  a: [1, 2, 3],
  b: 'foo'
});
_atMaybeArray(x).call(x, -1);