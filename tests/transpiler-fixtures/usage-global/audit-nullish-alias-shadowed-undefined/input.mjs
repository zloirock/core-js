// an alias whose reachable values are all nullish dispatches nothing, so the typeless instance row
// is suppressed. `undefined` is SHADOWABLE though, and a shadowed one is an ordinary value that may
// well dispatch - the nullish verdict needs the scope check, not the bare identifier shape. a
// shadow in a sibling scope does not reach this use. the same gate applies where `undefined` is a
// PROTOTYPE value: shadowed it is an object that installs a dispatcher, unshadowed it is the
// no-op the spec defines. distinct method per line
export function shadowed() {
  let undefined = [1];
  let alias = null;
  alias ||= undefined;
  return alias.at(0);
}
export function genuine() {
  let alias = null;
  alias ||= undefined;
  return alias.flatMap(f);
}
function siblingScope() {
  let undefined = [2];
  return undefined;
}
export function unshadowedHere() {
  let alias = null;
  alias ||= undefined;
  return alias.findLast(f);
}
export const keepSibling = siblingScope;
export function shadowedProtoValue() {
  const undefined = Array.prototype;
  const target = { __proto__: undefined };
  return target.toSpliced(0);
}
export function genuineProtoValue() {
  const target = { __proto__: undefined };
  return target.copyWithin(0);
}
