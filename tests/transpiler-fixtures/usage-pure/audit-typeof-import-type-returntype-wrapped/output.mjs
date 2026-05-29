import _at from "@core-js/pure/actual/instance/at";
// The return type is `typeof import('foo').fn` - a cross-module reference whose signature is
// opaque to the resolver. The return type cannot be determined, so it falls through to a
// structural bail: the instance call `.at(0)` is still polyfilled, but as the generic
// variant rather than the Array-specific one.
function getFn(): typeof import("foo").fn {
  return null as any;
}
const r = getFn()();
_at(r).call(r, 0);