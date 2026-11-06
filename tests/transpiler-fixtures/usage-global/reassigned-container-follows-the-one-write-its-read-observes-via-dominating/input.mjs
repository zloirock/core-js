// a REASSIGNED container binding resolves like the bare binding-alias canon, lifted to every walk hop: a
// DOMINATING write kills the declared init, and its value walks the remaining path - a pattern, a member
// read, an array wrapper, a class base, a reassigned class, a write behind an effect, a cross-form pattern
// write, a `??=` over an unset binding - so each static loads for that value, never for the init
let rw1 = { k: Object };
rw1 = { k: Map };
const { k: { groupBy: viaDominating } } = rw1;
export { viaDominating };
