// A realm hop folds according to the value its consumer observes. An environment
// probe read by a kept store or a guard retains its slot over the backed root;
// plain navigation through the run follows the realm-collapse rule. Terminal
// values and computed-key effects remain observable in their original positions.
let e = 0;
// NEGATIVE: a COMPUTED key keeps its slot - folding it would fold its effects away with it -
// and the backed run under it still collapses, so the key reads off the ponyfill
export const computedKeyStays = globalThis.self[(e++, 'window')];
export { e };
