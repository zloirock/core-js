// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// ... while a key that FOLDS through its binding names another slot and leaves the pairing alone,
// on the symbol route as on every other - the resolver folds it with the same scope the pairing uses
const boundKey = 'q';
const { w: { [Symbol.iterator]: viaBoundKey } } = { w: globalThis, [boundKey]: other };
let underOptional = other;
export default [viaBoundKey];
