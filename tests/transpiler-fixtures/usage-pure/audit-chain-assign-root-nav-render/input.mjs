// a probe nav whose ROOT is a chain assignment. the hop `.self` is SUPPRESSED by the detector's
// marking - which exists so the text emitter never queues a rewrite overlapping the span that
// swallowed it - and with it went the meta that drives the AST emitter's kept-nav render, leaving
// a native `self` read. the marking stays; the hop is recorded as still-live instead, and only a
// meta whose own object is an ordinary name (a receiver PATH, not the chain's claim) records it
globalThis.assignBox = { list: ['ab', 'cd'], n: 1 };
let heldClaim;
export const withClaim = (heldClaim = globalThis)?.window?.self.Array.of(5);
let heldDispatch;
export const withDispatch = (heldDispatch = globalThis)?.window?.self.assignBox.list?.at(0);
let heldPlain;
export const withPlainTail = (heldPlain = globalThis)?.window?.self.assignBox.n;
let heldNonOptional;
export const withNonOptionalRoot = (heldNonOptional = globalThis).window?.self.assignBox.list?.at(0);
export { heldClaim, heldDispatch, heldPlain, heldNonOptional };

// the same shapes over a tail name this file never writes: the detector knows nothing about it,
// which is exactly the case the suppressed hop used to swallow
let heldUnknown;
export const unknownTail = (heldUnknown = globalThis)?.window?.self.unknownBox.list?.at(0);
let heldUnknownDeep;
export const unknownDeepTail = (heldUnknownDeep = globalThis)?.window?.self.unknownBox.inner.list?.at(0);
export { heldUnknown, heldUnknownDeep };

// a claimless VALUE use over the same root: the hop collapse refuses a short-circuitable nav by
// canon, so both emitters fall through to the kept-nav render there - the text one needed that
// fallback built (it had one only for receiver positions)
let heldValue;
export const plainValueTail = (heldValue = globalThis)?.window?.self.unknownBox.n;
let heldValueDeep;
export const plainValueDeepTail = (heldValueDeep = globalThis)?.window?.self.unknownBox.inner.n;
export { heldValue, heldValueDeep };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = ['ab', 'cd'].at(globalThis.window?.self.assignBox.list ? 0 : 1)?.includes('a');
