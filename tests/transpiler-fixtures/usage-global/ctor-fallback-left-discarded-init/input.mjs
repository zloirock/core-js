// In usage-global the destructures stay as written and each live operand of an init injects its own
// family: the dead right of a deciding left injects nothing - every right names a family no other row
// reads, so its absence is this row's alone - while a right a maybe-falsy left keeps live is injected.
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
