import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A side-effect-prefixed proxy-global WHOLE-CONSTRUCTOR receiver in a function-parameter default
// must swap to the pure constructor AND preserve the SE prefix, not drop the swap and keep the
// native `_globalThis.Promise`. The retained `...rest` keeps the receiver live; without the fix the
// SE prefix forced the residual receiver verbatim instead of the pure binding.
function effect() {
  return 0;
}
function withDefault({
  allSettled: _unused,
  ...promiseRest
} = (effect(), _Promise)) {
  let allSettled = _Promise$allSettled;
  return allSettled([]);
}
withDefault();