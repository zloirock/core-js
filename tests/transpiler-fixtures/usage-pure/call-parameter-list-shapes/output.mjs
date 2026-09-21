import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A parameter LIST that spells slots nobody hands back - a default, a rest element, a destructuring
// pattern - does not move WHICH slot the callee returns, so the value resolves through it. A list
// that RUNS keeps the call, and the work runs where the source wrote it. A default that WRITES the
// returned slot describes a value the argument no longer names, and declines. Each row reads a
// different static, so one injection cannot stand in for another.
function mark() {
  return 1;
}
function afterDefault(value, n = 1) {
  return value;
}
function afterRest(value, ...rest) {
  return value;
}
function afterPattern(value, {
  k
}) {
  return value;
}
function afterEffect(value, n = mark()) {
  return value;
}
function reboundByDefault(value, n = value = Array) {
  return value;
}
export const inert = _Map$groupBy([1], x => x);
export const rested = _Object$groupBy([2], x => x);
export const patterned = (afterPattern(_Promise, {
  k: 1
}), _Promise$withResolvers)();
export const effectful = (afterEffect(Array), _Array$from)([3]);
export const declined = reboundByDefault(_Promise).of(4);