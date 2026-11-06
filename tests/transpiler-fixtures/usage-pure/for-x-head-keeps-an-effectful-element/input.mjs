// A for-x head has no statement slot: the declaration twin leaves an effectful receiver standing
// where it is written and binds the leaf beside it, while the head's only route is the mirror, which
// REPLACES the element. Refusing every effect there lost the polyfill on each invocation spelling.
// The element rides as the sequence PREFIX of the literal that takes its place, so it runs as often
// and as early as the source runs it and keeps its throw - only the value the mirror replaces is
// dropped. A read inside that prefix still owes its own substitution.
const log = [];
function make(seen) { log.push(seen); return Array; }
function tag() { return Array; }
for (const { from } of [make(0)]) log.push(typeof from);
for (const { of } of [tag`x`]) log.push(typeof of);
for (const { from } of [make.call(null, 1)]) log.push(typeof from);
for (const { from } of [make.apply(null, [2])]) log.push(typeof from);
for (const { from } of [Reflect.apply(make, null, [3])]) log.push(typeof from);
for (const { from } of [make.bind(null, 4)()]) log.push(typeof from);
// the prefix is not quarantined: the global it reads is substituted like any other
for (const { from } of [make(Object.assign({}, { tag: 5 }))]) log.push(typeof from);
// NEGATIVE: a slot the literal cannot spell needs the receiver's live value, and the head has
// nowhere to memo it - so a partial pattern and a rest both stay native over the effect
for (const { from, absent } of [make(6)]) log.push(typeof from, typeof absent);
for (const { from, ...rest } of [make(7)]) log.push(typeof from, 'from' in rest);
export { log };
