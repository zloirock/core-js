// The element producer runs at its source position, including its effects and throws.
// A retained pattern with rest reads its properties when the loop binds the element.
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
// The extra property is read from the returned receiver when its pattern slot is reached.
// A rest copies the remaining own properties of that same receiver.
for (const { from, absent } of [make(6)]) log.push(typeof from, typeof absent);
for (const { from, ...rest } of [make(7)]) log.push(typeof from, 'from' in rest);
export { log };
