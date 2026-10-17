// A sole-key object hop pairs with the slot it names, like an array wrapper with its element.
// Pure getters may collapse; effectful getters keep their reads and use the actual slot's identity
// to select the ponyfill. A later spread or unknown key keeps the runtime override in that choice.
// A constructor escaping through the getter includes its static methods.
const other = {};
// a value the level SELECTS between arms is the selecting-receiver channel's, not a pair
const { w: { WeakRef: keptByBranch } } = { w: other ? globalThis : globalThis };
let underOptional = other;
export default [keptByBranch];
