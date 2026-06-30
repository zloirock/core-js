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
