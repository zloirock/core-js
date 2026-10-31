import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
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
// a binding a pattern takes off a container stands for that slot wherever it goes next, so a constructor
// written through any of these reaches a static read back through the container's path - an alias of the
// binding, a write one level deeper through it, a pattern taken off it in turn, and a pattern taken off a
// member-path alias
const box = {
  inner: {
    C: Array
  }
};
const {
  inner: alias
} = box;
const copy = alias;
copy.C = Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    deep: {
      C: Object
    }
  }
};
const {
  inner: held
} = holder;
held.deep.C = Map;
export const grouped = holder.inner.deep.C.groupBy([1], x => x);
const nest = {
  inner: {
    deep: {
      C: Array
    }
  }
};
const {
  inner: outer
} = nest;
const {
  deep
} = outer;
deep.C = Promise;
export const settled = nest.inner.deep.C.allSettled([]);
const tree = {
  inner: {
    deep: {
      C: Object
    }
  }
};
const branch = tree.inner;
const {
  deep: leaf
} = branch;
leaf.C = Symbol;
export const registered = tree.inner.deep.C.for('a');