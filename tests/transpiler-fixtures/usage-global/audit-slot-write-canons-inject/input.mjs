// usage-global equivalents of the slot-write canons: injection is the whole reaction - the
// polyfill loads at bundle start, the user's write overwrites it at runtime, reads then see
// the live value; the text stays verbatim. proxy-root write, container write, member slot
// write, static patch (polyfill-then-patch) and the identity self-copy all inject their
// names' modules like any other usage
window = fake;
use(window.Promise.resolve(1));
self++;
use(self.Map.groupBy(items, tag));
globalThis.Set = Shim;
use(new Set([1]));
Iterator.from = patch;
use(Iterator.from(items));
({ WeakMap } = globalThis);
use(new WeakMap());
