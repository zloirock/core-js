// A parameter LIST that spells slots nobody hands back - a default, a rest element, a destructuring
// pattern - does not move WHICH slot the callee returns, so the value resolves through it. A list
// that RUNS keeps the call, and the work runs where the source wrote it. A default that WRITES the
// returned slot describes a value the argument no longer names, and declines. Each row reads a
// different static, so one injection cannot stand in for another.
function mark() { return 1; }
function afterDefault(value, n = 1) { return value; }
function afterRest(value, ...rest) { return value; }
function afterPattern(value, { k }) { return value; }
function afterEffect(value, n = mark()) { return value; }
function reboundByDefault(value, n = (value = Array)) { return value; }
export const inert = afterDefault(Map).groupBy([1], x => x);
export const rested = afterRest(Object, 1).groupBy([2], x => x);
export const patterned = afterPattern(Promise, { k: 1 }).withResolvers();
export const effectful = afterEffect(Array).from([3]);
export const declined = reboundByDefault(Promise).of(4);
