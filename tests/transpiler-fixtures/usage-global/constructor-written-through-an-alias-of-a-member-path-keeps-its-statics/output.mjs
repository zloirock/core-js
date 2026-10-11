import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
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
// a constructor written through a binding that aliases a member path lands on the slot under that path, so a
// static read back through the path reaches the written constructor's static, and pure takes the entry carrying
// it - through an alias, an alias of it, a chain of such aliases read through the whole path or from the
// chain's middle alias, and onto a slot the literal never spelled
const box = {
  inner: {
    C: Array
  }
};
const alias = box.inner;
alias.C = Iterator;
export const copied = box.inner.C.from([1]);
const holder = {
  inner: {
    C: Object
  }
};
const first = holder.inner;
const second = first;
second.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const nest = {
  inner: {
    deep: {
      C: Array
    }
  }
};
const outer = nest.inner;
const deep = outer.deep;
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
const leaf = branch.deep;
leaf.C = Symbol;
export const registered = branch.deep.C.for('a');
const empty = {
  inner: {}
};
const hole = empty.inner;
hole.C = URL;
export const valid = empty.inner.C.canParse('a:b');