import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.of";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a `||` whose left yields a fresh object behind an effect prefix or a store decides for that left, as
// the fresh object spelled alone does: the right never runs, so its arm names nothing - each leaf loads
// its left's static alone, in a declaration and an assignment alike, though every right names modules
export const {
  C: {
    groupBy
  }
} = (console.log(), {
  C: Map
}) || {
  C: Object
};
let stash;
export const {
  C: {
    from
  }
} = (stash = {
  C: Iterator
}) || {
  C: Array
};
let held;
export const {
  C: {
    of
  }
} = (held = {
  C: Array
}) || {
  C: Int8Array
};
let box, fromAsync;
({
  C: {
    fromAsync
  }
} = (box = {
  C: Array
}) || {
  C: WeakSet
});
export { fromAsync };