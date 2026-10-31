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
// a write through a binding holding a member path of a container - a member alias, a binding a pattern takes off
// it, a path off such an alias, the slot of a literal spelled in place - replaces the slot it lands on whatever it
// stores, so the constructor the literal held there is read back off the slot and keeps its statics; a member
// alias no write goes through leaves the literal's constructor to the read
const first = {
  inner: {
    C: Map
  }
};
const member = first.inner;
member.C = Object;
export const byKey = first.inner.C.groupBy([1], x => x);
const second = {
  inner: {
    C: Promise
  }
};
const {
  inner: taken
} = second;
taken.C = userValue;
export const all = second.inner.C.allSettled([]);
const third = {
  inner: {
    deep: {
      C: Iterator
    }
  }
};
const outer = third.inner;
const nested = outer.deep;
nested.C = userValue;
export const wrapped = third.inner.deep.C.from([1]);
const fourth = {
  C: URL
};
const held = {
  slot: fourth
}.slot;
held.C = userValue;
export const valid = fourth.C.canParse('a:b');
const fifth = {
  inner: {
    C: Symbol
  }
};
const read = fifth.inner;
export const shared = fifth.inner.C.for(read ? 'a' : 'b');