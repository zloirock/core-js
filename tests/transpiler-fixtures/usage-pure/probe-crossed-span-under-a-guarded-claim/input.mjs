// A stored realm run whose backed span carries the source's own `?.`, read through the store by a
// claim the pass rewrites behind a guard. That branch has no landing, so the collapse spells the
// run instead: the probe lowers into the guard's test, the backed hop folds onto its ponyfill, and
// a sequence prefix under the run runs inside that test. The last line is the negative that pins
// the boundary - a `?.` ABOVE the span lands, and the probe read the store observes stays.
let c = 0;

let crossed;
export const probeCrossesTheSpan = (crossed = globalThis.window?.self.Number)?.isInteger(1);

let prefixed;
export const seqPrefixUnderTheRun = (prefixed = (c++, globalThis).window?.self.Promise)?.resolve(1);

let above;
export const probeOverTheSpanLands = (above = globalThis.self.window?.Array)?.from([1]);

// the stores are read back rather than EXPORTED: an exported binding hands its value to importers,
// and every constructor stored here would leave the file with it - a widening this row's channel
// has no part in. `typeof` keeps each store live without handing anything out
export const stored = [typeof crossed, typeof prefixed, typeof above];
export { c };
