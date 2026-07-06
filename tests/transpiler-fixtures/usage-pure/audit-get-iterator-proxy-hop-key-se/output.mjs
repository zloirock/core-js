import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// proxy-global hop get-iterator (`globalThis[(eff(), 'self')][Symbol.iterator]`): the `.self` hop collapses
// to the root pure import (`_globalThis`), but the hop's OWN side effect must survive. when a computed
// iterator-key SE follows, a NON-optional receiver is peeled - so the dropped-hop SE is routed through the SE
// channel ahead of the key SE (native order: hop then key); with no key SE it stays inline in the collapsed
// receiver; an OPTIONAL receiver keeps the inline sequence (its null-guard memoize replays the hop SE)

// hop SE + computed iterator-key SE, non-optional: both run, hop before key (routed through the SE channel)
const a = (hop(), key(), _getIterator(_globalThis));

// hop SE, no iterator-key SE: the hop SE stays inline in the collapsed receiver (no peel)
const b = _getIterator((probe(), _globalThis));

// OPTIONAL access + iterator-key SE: NOT routed - the receiver keeps its `(hopSE, _root)` sequence memoized in
// the null guard (a bare collapsed root would have nothing to replay), so both emitters keep the same memo form
const c = (null == (_ref = (mark(), _globalThis)) ? void 0 : (tag(), void 0), _getIterator(_ref));

// MID-CHAIN optional (`?.` two-plus hops below the symbol access): the optional verdict is decided
// ONCE by the provider (flag-based chain walk), so both emitters keep the inline `(hopSE, _root)`
// memo form - an emitter-local one-hop probe would route the hop SE flat and diverge
const d = (_ref2 = (hop2(), _globalThis), key2(), _getIterator(_ref2));
const e = (_ref3 = (hop3(), _globalThis), key3(), _getIterator(_ref3));

// SEALED `?.` (paren-terminated, sequence-buried, cast-sealed): the optional is not live for this
// access - the flag walk stops at the seal, both emitters take the FLAT route and the hop SE
// survives in the SE channel (an aggregating walk would mis-route babel into a peel that drops it)
const f = (hop4(), key4(), _getIterator(_globalThis));
const g = (eff5(), hop5(), key5(), _getIterator(_globalThis));