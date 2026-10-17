// A nested assignment reads an instance member of a static (`name` of `Array.of`) through the static's
// ponyfill in every host an assignment takes: beside a sibling, inside a sequence or an unbraced `if`,
// under an array wrapper and over a leaf default. A constructor with a narrow entry (`Map`) has its
// static read off the static's own entry, which its narrow entry does not carry.
let name, junk, arity;
({ Array: { of: { name }, junk } } = globalThis);
({ Array: { of: { name } } } = globalThis);
(arity = 1, ({ Array: { of: { name } } } = globalThis));
if (arity) ({ Array: { of: { name } } } = globalThis);
[{ Array: { of: { name } } }] = [globalThis];
({ Array: { of: { name = 'd' } } } = globalThis);
({ Map: { groupBy: { name } } } = globalThis);
export { name, junk, arity };
