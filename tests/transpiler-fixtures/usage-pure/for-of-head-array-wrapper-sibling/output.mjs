import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-of head has no statement slot for a residual extraction, so a static read through a
// multi-element array wrapper takes the head mirror: the iterated literal's element carries the
// polyfill and the sibling slot keeps its own effect in source order.
const log = [];
const eff = t => (_pushMaybeArray(log).call(log, t), t);
const out = [];
for (const [{
  from
}, tail] of [[{
  from: _Array$from
}, eff(1)], [{
  from: _Array$from
}, eff(2)]]) _pushMaybeArray(out).call(out, from([1]).length, tail);
for (let [{
  of
}, count] of [[{
  of: _Array$of
}, 1]]) _pushMaybeArray(out).call(out, of(1).length, count);
for (const [{
  Array: {
    isArray
  }
}, tail] of [[_globalThis, eff(3)]]) _pushMaybeArray(out).call(out, isArray([]), tail);
for (const [[{
  from
}], tail] of [[[{
  from: _Array$from
}], 4]]) _pushMaybeArray(out).call(out, from([1]).length, tail);
export { out, log };