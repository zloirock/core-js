import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` / `??` left that is a call returning a constructor, a sequence ending in one or a store of one
// decides its selection, so a pattern over it extracts the static in every host - beside a rest or a
// sibling, in a parameter default and between sibling declarators - with the left's effect kept ahead.
const pickMap = () => Map;
const pickPromise = () => Promise;
let n = 0,
  held;
const {
  from: f1,
  ...r1
} = (n++, Array) || Iterator;
const {
  groupBy: g2,
  size
} = pickMap() || Set;
const {
  of: o3,
  other3
} = (n++, Array) ?? WeakSet;
function p4({
  try: t4
} = pickPromise() || AggregateError) {
  return t4;
}
const a5 = 1,
  {
    fromEntries: e5
  } = (held = Object) || WeakMap,
  b5 = 2;
export { f1, r1, g2, size, o3, other3, p4, a5, e5, b5, n };