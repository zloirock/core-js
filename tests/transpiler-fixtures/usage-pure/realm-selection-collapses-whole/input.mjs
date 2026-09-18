// A value-SELECTING receiver every branch of which yields the REALM has no branch worth swapping:
// the proxy globals are ONE object, so wherever a branch resolves it IS that realm, and the flatten
// binds the polyfill while the whole selection drops - where a single-branch swap left a host that
// HAS `window` reading the realm natively. A BARE name pure does not back reads the same way, at the
// one price of the ReferenceError an undeclared one owes: the author's own fallback answers instead.
// A fallback that is NOT the realm is the negative - off-window that plain object is the value.
// A pattern of only flat CONSTRUCTOR slots collapses the same way, with no nested prop to lead.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- bare proxy names are the shape under test */
const { Map: { groupBy: viaProbeHop } } = globalThis.window ?? globalThis;
const { Map: { groupBy: viaBackedHop } } = globalThis.self ?? globalThis;
const { Map: { groupBy: viaBareBacked } } = self ?? globalThis;
const { Map: { groupBy: viaSecondProbe } } = globalThis.global ?? globalThis;
const { Map: { groupBy: viaBareUnbacked } } = window ?? globalThis;
const { Map: { groupBy: viaPlainFallback } } = globalThis.window ?? {};
const { Set: SoleCtor } = window ?? globalThis;
const { Set: PairCtor, Map: PairMap } = globalThis.window ?? globalThis;
export { viaProbeHop, viaBackedHop, viaBareBacked, viaSecondProbe, viaBareUnbacked, viaPlainFallback };
export { SoleCtor, PairCtor, PairMap };
