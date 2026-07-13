// surfaces of a mutated global SLOT beyond the static read: a replaced constructor DEOPTS -
// every read stays verbatim on the live binding, never the pristine ponyfill

// a bare `Ctor.prototype.<key>` read on a slot-replaced ctor stays raw like its static twin
// (the pristine `_Promise.prototype` swap silently dropped the shim)
globalThis.Promise = shimA;
Promise.prototype.spread(fn);

// the static control keeps its locked canon
use(Promise.resolve(1));

// a CALL-EXPRESSION mutation receiver records like an identifier one: the scoped stage
// inlines the transparent call, so the cheap gate must fire for it too
const getArr = () => Array;
getArr().from = myFrom;
use(Array.from(x));

// a BARE reassignment of a global name writes the same slot as `globalThis.Map = ...`:
// later reads (static AND prototype) route the live slot
Map = shimB;
use(Map.groupBy(y, k));
Map.prototype.has(1);

// a bound local of the same name is an ordinary variable - reads stay on the local
let Set = localShim;
Set = other;
use(Set.union(z));

// a MUTATED proxy hop keeps the chain raw AND the type channel drops to the generic
// dispatcher (a type-specific helper would dispatch pristine array methods on the fake)
globalThis.self = { Array: FakeArray };
const arr = new globalThis.self.Array(3);
use(arr.at(0), arr.includes(2));

export { arr };
