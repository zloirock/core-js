import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
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
globalThis.claimBox = {
  list: ['ab', 'cd'],
  get: function () {
    return ['ef'];
  }
};
let k = 0;
export const callReceiverResolvedKey = globalThis.window?.self.claimBox.get()[k++, 'at'](0);
export const callReceiverStaticKey = globalThis.window?.self.claimBox.get().at(0);
export const memberReceiverResolvedKey = globalThis.window?.self.claimBox.list[k++, 'at'](0);

// the same claim WITHOUT an enclosing guard keeps its own emission - the negative that pins the
// consumed-nav condition rather than the mere presence of a claim
export const unguardedCallReceiver = globalThis.self.claimBox.get()[k++, 'at'](0);
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

// a nav nested in an ARGUMENT keeps its OWN test, and the rows below walk what sits between the two
// reads of the root: nothing, a call, an assignment. no spelling may lift the inner test over the
// call the source wrote - that turns the argument's short-circuit into the whole call's, and where
// the probe is absent the source still evaluates the call with an undefined argument
let hops = 0;
function bump() {
  hops += 1;
  return 0;
}
export const callBetweenRootReads = globalThis.window?.self.Array.of(bump(), globalThis.window?.self.Math.trunc(1.5));
export const assignBetweenRootReads = globalThis.window?.self.Array.of(hops = 1, globalThis.window?.self.Math.trunc(2.5));
export { hops };

// a plain property read in the same slot: its getter is user code, so it can reach the root between
// the two reads exactly as a call can
const hopBox = {
  n: 4
};
export const readBetweenRootReads = globalThis.window?.self.Array.of(hopBox.n, globalThis.window?.self.Math.trunc(3.5));

// the outer chain's own CALL runs in full between the two reads, and its argument can reach the root
// through an iterator or an accessor - another shape whose inner test has to stay put
const seed = [7, 8];
export const spineCallBeforeKey = globalThis.window?.self.Array.from(seed)[globalThis.window?.self.Math.trunc(0.5)];
export const spineCallBeforeArg = globalThis.window?.self.Object.keys({
  a: 1
}).at(globalThis.window?.self.Math.round(0.4));
// a SPREAD argument is evaluated where the spread sits and the expansion follows it
export const spreadArgument = globalThis.window?.self.Array.of(...[globalThis.window?.self.Math.trunc(1.5)]);

// the guard channel lifts a nested nav's node into a ternary alternate WITHOUT a path replace, so
// the chain walk above it answers from an emptied slot. it has to end there instead of replacing
// through it - the second row keeps nothing polyfilled on the outer tail, which is a different
// resolver route to the same nesting
export const nestedNavPlainTail = globalThis.window?.self.Object.keys({
  b: 2
}).pop(globalThis.window?.self.Math.round(0.4));
export const nestedNavOpaqueStatic = globalThis.window?.self.JSON.stringify({
  c: 3
}).at(globalThis.window?.self.Math.round(0.4));