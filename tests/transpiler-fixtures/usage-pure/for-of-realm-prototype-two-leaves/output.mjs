import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A realm element retains each nested prototype receiver through an assignment head.
let at, includes;
for (const _ref of [_globalThis]) {
  at = _atMaybeArray(_globalThis.Array.prototype);
  includes = _includesMaybeArray(_globalThis.Array.prototype);
  use(at, includes);
}