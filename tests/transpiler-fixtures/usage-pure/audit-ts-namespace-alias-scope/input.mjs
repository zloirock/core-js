// a namespace-hosted ctor alias serves only the namespace body (it compiles to an IIFE):
// the same-named read AFTER the body is a runtime ReferenceError the registration must
// not narrow, while the in-body read narrows normally
namespace N {
  const { Map: M } = globalThis;
  export const v = M.groupBy(items, keyFn);
}
export const r = M.groupBy(items, keyFn);
