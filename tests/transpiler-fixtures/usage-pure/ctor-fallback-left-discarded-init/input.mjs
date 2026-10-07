// A destructure init whose `||` / `??` constructor LEFT always decides owes, once every property is
// extracted, its prefix and that left's effects alone: the right never runs, so it leaves with the value -
// in a bodyless slot, a sequence element and a loop header too. A left that may be falsy keeps both
// operands and the live right is mirrored.
function make() { log(); return Map; }
let n = 0;
const { groupBy } = make() || Set;
const { for: forKey } = (n++, Symbol) || WeakSet;
let ownKeys;
({ ownKeys } = (n++, Reflect) ?? WeakMap);
const { withResolvers } = (n++, Promise || Iterator);
let race, allSettled;
if (n >= 0) ({ race } = Promise ?? (n++, URL));
const tail = (({ allSettled } = Promise || (n++, DOMException)), n);
let keyFor, reject;
({ keyFor } = (n++, Symbol || DisposableStack));
if (n >= 0) ({ reject } = (n++, Promise ?? (n++, AsyncDisposableStack)));
if (n >= 0) var { any } = (n++, Promise || (n++, queueMicrotask));
for (var { try: attempt } = (n++, Promise ?? (n++, Float32Array)); ;) break;
const maybe = pick();
const { from } = maybe || Array;
export { groupBy, forKey, ownKeys, withResolvers, race, allSettled, tail, keyFor, reject, any, attempt, from, n };
