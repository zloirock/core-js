import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global the bodyless slots stay as written: each claim injects its own module - the instance
// method in the prefix and the static read off the realm nav alike - and the realm call keeps its read.
const realm = () => globalThis;
const stamp = () => (realm.count = 1, globalThis);
const lists = [[1], [2]];
if (lists.length) var {
  groupBy
} = (lists.flat(), realm().Map);
if (lists.length) var {
  from
} = (lists.at(0), stamp().Array);
if (lists.length) var {
  allSettled
} = realm().Promise;
if (lists.length) var {
  of
} = realm().Array;
if (lists.length) var {
  entries,
  fromEntries
} = (lists.findLastIndex(Boolean), stamp().Object);
if (lists.length) var {
  values,
  hasOwn
} = realm().Object;
export { groupBy, from, allSettled, of, entries, fromEntries, values, hasOwn };