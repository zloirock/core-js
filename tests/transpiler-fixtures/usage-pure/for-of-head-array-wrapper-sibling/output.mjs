import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const log = [];
const eff = t => (_pushMaybeArray(log).call(log, t), t);
const out = [];
for (const [{
  from
}, tail] of [[Array, eff(1)], [Array, eff(2)]]) (_pushMaybeArray(out) || 0).call(out, from([1]).length, tail);
for (let [{
  of
}, count] of [[Array, 1]]) (_pushMaybeArray(out) || 0).call(out, of(1).length, count);
for (const [{
  Array: {
    isArray
  }
}, tail] of [[_globalThis, eff(3)]]) (_pushMaybeArray(out) || 0).call(out, isArray([]), tail);
for (const [[{
  from
}], tail] of [[[Array], 4]]) (_pushMaybeArray(out) || 0).call(out, from([1]).length, tail);
export { out, log };