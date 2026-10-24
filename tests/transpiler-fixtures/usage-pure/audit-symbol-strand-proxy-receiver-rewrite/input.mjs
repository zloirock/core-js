// a well-known-symbol read off a proxy-global receiver is NOT an iterator-strand collapse
// (`Symbol.asyncIterator` / `Symbol.toStringTag` carry no get-iterator entry): the receiver must
// fall to the regular proxy-global rewrite instead of being subsumed by the symbol dispatch - a
// subsumed receiver stranded a raw `self` / a raw `.self` hop (off-engine ReferenceError /
// undefined read). a LIVE `Symbol.iterator` entry still collapses the whole read to the
// get-iterator-method helper over the pure root.
const bareSelf = self[Symbol.asyncIterator];
const hop = globalThis.self[Symbol.toStringTag];
const live = globalThis.self[Symbol.iterator];
export { bareSelf, hop, live };
