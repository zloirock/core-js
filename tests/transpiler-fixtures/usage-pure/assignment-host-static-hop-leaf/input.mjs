// A nested assignment reads instance members through the static's ponyfill.
// The same rule holds through bare, nested and wrapped constructor receivers.
let name, junk, arity;
({ Array: { of: { name }, junk } } = globalThis);
({ Array: { of: { name } } } = globalThis);
(arity = 1, ({ Array: { of: { name } } } = globalThis));
if (arity) ({ Array: { of: { name } } } = globalThis);
[{ Array: { of: { name } } }] = [globalThis];
({ Array: { of: { name = 'd' } } } = globalThis);
// A re-anchored residual reads a static off the constructor's alias by the constructor's NAME,
// so the narrow constructor entry is never read through.
({ Map: { groupBy: { name } } } = globalThis);
// A typed user nav the extraction OWNS dispatches on the nav, the host dying with the claim.
let at;
const source = { y: [1, 2] };
({ y: { at } } = source);
// An anonymous default the dispatch may fire keeps the binding's inferred NAME through the guard,
// the declaration host's spelling - off a receiver the type channel cannot name.
let fallback;
function pickFallback(foreign) {
  ({ y: { at: fallback = () => -1 } } = foreign);
}
// A typed nav whose type LACKS the method claims nothing, the declaration host's answer: the
// default keeps running natively.
let absent;
const plain = { y: {} };
({ y: { at: absent = () => -1 } } = plain);
export { name, junk, arity, at, fallback, pickFallback, absent };
