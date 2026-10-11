import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
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
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a constructor written through a binding a pattern takes off a container through static keys lands on the
// slot the pattern takes, so a static read back through the container's path reaches the written
// constructor's static: pure takes the entry carrying it and leaves the call off the literal's own value, and
// global loads it - over a renamed key, a shorthand, a nested pattern, a computed literal key, and a member path
const box = {
  inner: {
    C: Array
  }
};
const {
  inner: alias
} = box;
alias.C = Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    C: Object
  }
};
const {
  inner
} = holder;
inner.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const nest = {
  outer: {
    inner: {
      C: Array
    }
  }
};
const {
  outer: {
    inner: deep
  }
} = nest;
deep.C = Promise;
export const settled = nest.outer.inner.C.allSettled([]);
const tree = {
  inner: {
    C: Object
  }
};
const {
  ['inner']: leaf
} = tree;
leaf.C = Symbol;
export const registered = tree.inner.C.for('a');
const root = {
  box: {
    inner: {}
  }
};
const {
  inner: hole
} = root.box;
hole.C = URL;
export const valid = root.box.inner.C.canParse('a:b');