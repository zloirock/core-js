import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// a for-init declarator records a phantom self-violation; the filtered binding stand-in
// must keep a STABLE identity across lookups - per-binding caches and closure sets key by
// object identity, and a fresh copy per call silently dropped the recorded incompatible
// write, narrowing the union to a stale type-specific helper
for (let o = {
  data: [1, 2] as number[] | string
}; _globalThis.cond;) {
  var _ref;
  o.data = 'str';
  _at(_ref = o.data).call(_ref, 0);
  break;
}