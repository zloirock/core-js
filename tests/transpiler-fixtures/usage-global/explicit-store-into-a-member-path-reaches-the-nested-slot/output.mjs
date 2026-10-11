import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
// an explicit store into a member path lands on the slot under that path, as a member write spelled through it
// does, so a static read back through the path loads the stored constructor's static - `Object.assign` with a
// known or an unknown key, and `Reflect.set`
const box = {
  inner: {
    C: Object
  }
};
Object.assign(box.inner, {
  C: Map
});
export const grouped = box.inner.C.groupBy([1], x => x);
const holder = {
  inner: {
    C: Array
  }
};
Object.assign(holder.inner, {
  [key]: Iterator
});
export const copied = holder.inner.C.from([1]);
const tree = {
  inner: {
    C: Object
  }
};
Reflect.set(tree.inner, 'C', Promise);
export const settled = tree.inner.C.allSettled([]);