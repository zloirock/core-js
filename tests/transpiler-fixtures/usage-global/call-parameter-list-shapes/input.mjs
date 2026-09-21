// Defaults, rest and patterns do not move the returned slot; effectful defaults keep the call.
// A default that rewrites that slot prevents value substitution, but its closed caller still
// needs only the selected static. Each row reads a distinct method to keep injection observable.
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
