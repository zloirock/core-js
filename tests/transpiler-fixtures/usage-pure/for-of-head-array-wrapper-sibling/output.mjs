import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// For-of array heads retain native static reads and neighbouring elements.
// The iterable evaluates its effects before iteration and body push calls stay served.
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