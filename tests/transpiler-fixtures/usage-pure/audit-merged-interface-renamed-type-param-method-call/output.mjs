import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// class+interface merging with renamed type-param, METHOD CALL form - a different resolution
// path from the property-access variant in audit-merged-interface-renamed-type-param. the
// interface method's return uses the renamed `U`; without a per-interface subst remap,
// `box.fetch()` falls to generic dispatch instead of the array polyfill
class Box<T> {
  base(): T {
    return null!;
  }
}
interface Box<U> {
  fetch(): U[];
}
declare const box: Box<string>;
_atMaybeArray(_ref = box.fetch()).call(_ref, 0);