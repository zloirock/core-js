// an optional call through a NON-polyfillable member with a side-effecting computed key:
// the key effect runs exactly once in every emission shape, and the callee's `this` binding
// is preserved. the emitters legitimately differ in how they respell the member read
let eff = () => {};
const arr = { foo: () => [[1], [2]] };
export const viaIdentKey = arr[(eff(), 'foo')]?.().flat().at(0);

// a resolved key that is NOT a bare identifier keeps a bracket read (a dot respelling
// would reparse `arr.a-b` as subtraction)
const box = { 'a-b': () => [[1], [2]] };
export const viaOddKey = box[(eff(), 'a-b')]?.().flat().findLast(v => v > 0);

// a SINGLE trailing polyfill routes through the method-call recipe: the memoized callee
// must keep its `this` binding (`.call(recv)`), the key effect staying in the memo slot
const kit = { pick: () => [1, 2] };
export const viaSingleHop = kit[(eff(), 'pick')]?.().includes(2);

// a STATIC callee with a side-effecting computed key composes the effect ahead of the
// substituted static - no receiver binding is needed for a standalone static
export const viaStaticKey = Promise[(eff(), 'resolve')]?.(1);
