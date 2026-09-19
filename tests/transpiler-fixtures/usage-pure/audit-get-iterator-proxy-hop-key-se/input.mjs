// proxy-global hop get-iterator (`globalThis[(eff(), 'self')][Symbol.iterator]`): the `.self` hop collapses
// to the root pure import (`_globalThis`), but the hop's OWN side effect must survive. when a computed
// iterator-key SE follows, a NON-optional receiver is peeled - so the dropped-hop SE is routed through the SE
// channel ahead of the key SE (native order: hop then key); with no key SE it stays inline in the collapsed
// receiver; an OPTIONAL receiver keeps the inline sequence (its null-guard memoize replays the hop SE)

// hop SE + computed iterator-key SE, non-optional: both run, hop before key (routed through the SE channel)
const a = globalThis[(hop(), 'self')][(key(), Symbol.iterator)]();

// hop SE, no iterator-key SE: the hop SE stays inline in the collapsed receiver (no peel)
const b = globalThis[(probe(), 'self')][Symbol.iterator]();

// OPTIONAL access + iterator-key SE: NOT routed - the receiver keeps its `(hopSE, _root)` sequence memoized in
// the null guard (a bare collapsed root would have nothing to replay), so both emitters keep the same memo form
const c = (globalThis?.[(mark(), 'self')][(tag(), Symbol.iterator)])();

// MID-CHAIN optional (`?.` two-plus hops below the symbol access): the optional verdict is decided
// ONCE by the provider (flag-based chain walk), so both emitters keep the inline `(hopSE, _root)`
// memo form - an emitter-local one-hop probe would route the hop SE flat and diverge
const d = globalThis?.[(hop2(), 'self')].window[(key2(), Symbol.iterator)]();
const e = globalThis?.[(hop3(), 'self')].window.self[(key3(), Symbol.iterator)]();

// SEALED `?.` (paren-terminated, sequence-buried, cast-sealed): the optional is not live for this
// access - the flag walk stops at the seal, both emitters take the FLAT route and the hop SE
// survives in the SE channel (an aggregating walk would mis-route babel into a peel that drops it)
const f = (globalThis?.[(hop4(), 'self')]).window[(key4(), Symbol.iterator)]();
const g = (eff5(), globalThis?.[(hop5(), 'self')]).window[(key5(), Symbol.iterator)]();
