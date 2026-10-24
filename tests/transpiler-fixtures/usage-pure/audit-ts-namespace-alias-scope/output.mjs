import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a namespace-hosted ctor alias serves only the namespace body (it compiles to an IIFE):
// the same-named read AFTER the body is a runtime ReferenceError the registration must
// not narrow, while the in-body read narrows normally
namespace N {
  const M = _Map;
  export const v = _Map$groupBy(items, keyFn);
}
export const r = M.groupBy(items, keyFn);