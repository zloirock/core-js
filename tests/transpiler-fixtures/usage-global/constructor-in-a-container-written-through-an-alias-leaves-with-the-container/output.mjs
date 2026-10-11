import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
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
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a container written through an alias that is no plain one carries the constructors it holds into the slot it
// lands on: handed out with the container that slot belongs to, each keeps its statics - in usage-global its
// family - through an arm of a selection and a member path alike, and so does one read back through the slot; a
// container no one hands out or reads back hands out none
const first = {};
const spare = {};
const via = flag ? first : spare;
via.C = {
  D: Map
};
use(first);
const second = {
  inner: {}
};
const member = second.inner;
member.C = {
  D: Promise
};
use(second);
const third = {};
const either = opener || third;
either.C = {
  D: Iterator
};
export const wrapped = third.C.D.from([1]);
const fourth = {};
const kept = {};
const plain = flag ? fourth : kept;
plain.C = {
  D: URL
};