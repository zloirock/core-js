// the same temporal gate answers for a RECEIVER alias: a `const` holding a global but declared BELOW
// its use holds nothing there, so the use keeps the alias behind the runtime-checked fallback every
// unproven binding gets, and a class capturing it keeps its native `super`. the negatives pin the
// boundary: an alias read from a body called later swaps whole, and so does a declare-then-use.
export const tdzAlias = Later.from([1]);
export class TdzSub extends Later { static make() { return super.of(1); } }
const Later = Array;

export function deferred() { return Held.fromEntries([]); }
const Held = Object;

const Eager = Promise;
export const eager = Eager.allSettled([]);
