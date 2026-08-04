// a CALL receiver under a computed key that RESOLVES to a method name while carrying an effect: the
// dispatch spells the whole span itself - receiver memoized behind the guard, key effect migrated
// out - so the global channel's claim over the nav inside it has nothing left to compose into. a
// guard already queued over a root INSIDE the claim's span is what says the nav was consumed
// NOTE on the entry set this file records: the setup below WRITES a globalThis slot, which puts the
// whole file into the mutated-static deopt. after it no nav receiver is provably the native one, so
// every `at` here resolves to the full family set rather than a narrowed one - `Array.of(1).at(0)`
// included, which narrows on its own in a file without such a write. the subject here is claim
// OWNERSHIP, not narrowing; the narrowing signal lives on literal receivers, which the deopt
// does not touch
globalThis.claimBox = { list: ['ab', 'cd'], get: function () { return ['ef']; } };
let k = 0;
export const callReceiverResolvedKey = globalThis.window?.self.claimBox.get()[(k++, 'at')](0);
export const callReceiverStaticKey = globalThis.window?.self.claimBox.get().at(0);
export const memberReceiverResolvedKey = globalThis.window?.self.claimBox.list[(k++, 'at')](0);

// the same claim WITHOUT an enclosing guard keeps its own emission - the negative that pins the
// consumed-nav condition rather than the mere presence of a claim
export const unguardedCallReceiver = globalThis.self.claimBox.get()[(k++, 'at')](0);
export { k };

// STRONG negatives: a guard does sit over a root inside each claim's span, yet every claim below is
// still owed - the nav feeding it was never consumed into a memo. dropping any of these would lose
// a polyfill silently, which is the only way the ownership gate can go wrong
export const staticClaimUnderGuard = globalThis.window?.self.Array.of(1).at(0);
export const bareStaticClaim = globalThis.window?.self.Array;
export const twoClaimsOneStatement = [globalThis.window?.self.Array.of(1), globalThis.window?.self.Object.keys({})];
export const claimInsideArgument = globalThis.window?.self.Array.of(globalThis.window?.self.Math.trunc(1.5));
export const parenthesizedClaim = (globalThis.window?.self.Array).of(1);
export const claimThenInstance = globalThis.window?.self.Array.from('ab').at(0);
export const claimsAcrossOperator = globalThis.window?.self.Math.trunc(1.5) + globalThis.window?.self.Number.EPSILON;
