import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `makeBox(...args)` with a generic `<T>(t: T)` signature: SpreadElement expands into
// an unknown count of positional args at runtime, so positional param-to-arg mapping
// is unsafe. `call-site subst inference` must bail on ANY SpreadElement in the call's args,
// otherwise the T slot picks up the spread element's annotation (whatever it happens
// to be) and substitutes onto the return shape, mis-narrowing downstream chains.
// with the bail, T stays unsubstituted, return type sees the generic shape, and the
// final `.at()` lookup routes through the generic instance polyfill
function makeBox<T>(t: T): { v: T } {
  return { v: t };
}
declare const arr: string[];
const r = makeBox(...arr);
_at(_ref = r.v).call(_ref, 0);