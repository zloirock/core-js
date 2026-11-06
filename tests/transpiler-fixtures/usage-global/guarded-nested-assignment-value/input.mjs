// A consumed nested assignment yields its original receiver after all bindings.
// Sibling getters observe the guarded write at the source property's position.
// A constructor escaping through the getter includes its static methods.
let Value = 'before', first, last;
const log = [];
const source = {
  get first() { log.push(Value); return 1; },
  get realm() { log.push(Value); return globalThis; },
  get last() { log.push(typeof Value); return 2; },
};
const returned = ({ first, realm: { WeakSet: Value }, last } = source);
export { Value, first, last, returned, source, log };
