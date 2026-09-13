// A lexical alias read before its declaration is in the TDZ: pure keeps that native
// read without a guard or static import for the unreachable initializer. A class
// capturing it keeps its native super. Deferred reads and declare-then-use still fold.
export const tdzAlias = Later.from([1]);
export class TdzSub extends Later { static make() { return super.of(1); } }
const Later = Array;

export function deferred() { return Held.fromEntries([]); }
const Held = Object;

const Eager = Promise;
export const eager = Eager.allSettled([]);
