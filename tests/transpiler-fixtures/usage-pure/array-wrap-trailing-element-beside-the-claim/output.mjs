import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const [{
  Object: {
    fromEntries
  }
}] = [(eff('e'), _globalThis), eff('f')];
const [{
  Promise: {
    allSettled
  }
}] = [(eff('g'), _globalThis), 7];
export { fromEntries, allSettled, seen };