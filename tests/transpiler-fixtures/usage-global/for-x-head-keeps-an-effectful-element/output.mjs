import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The element producer runs at its source position, including its effects and throws.
// A retained pattern with rest reads its properties when the loop binds the element.
const log = [];
function make(seen) {
  log.push(seen);
  return Array;
}
function tag() {
  return Array;
}
for (const {
  from
} of [make(0)]) log.push(typeof from);
for (const {
  of
} of [tag`x`]) log.push(typeof of);
for (const {
  from
} of [make.call(null, 1)]) log.push(typeof from);
for (const {
  from
} of [make.apply(null, [2])]) log.push(typeof from);
for (const {
  from
} of [Reflect.apply(make, null, [3])]) log.push(typeof from);
for (const {
  from
} of [make.bind(null, 4)()]) log.push(typeof from);
// the prefix is not quarantined: the global it reads is substituted like any other
for (const {
  from
} of [make(Object.assign({}, {
  tag: 5
}))]) log.push(typeof from);
// NEGATIVE: a slot the literal cannot spell needs the receiver's live value, and the head has
// nowhere to memo it - so a partial pattern and a rest both stay native over the effect
for (const {
  from,
  absent
} of [make(6)]) log.push(typeof from, typeof absent);
for (const {
  from,
  ...rest
} of [make(7)]) log.push(typeof from, 'from' in rest);
export { log };