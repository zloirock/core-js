import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.iterator";
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
// a binding takes its slot off a container the same way whichever host destructures it, so a constructor
// written through it reaches a static read back through the container's path - an assignment pattern, an
// array pattern, a for-of head over a literal, a catch parameter of a thrown container, and a defaulted
// parameter
const holder = {
  inner: {
    C: Object
  }
};
let alias;
({
  inner: alias
} = holder);
alias.C = Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const list = [{
  C: Array
}];
const [first] = list;
first.C = Promise;
export const settled = list[0].C.allSettled([]);
const nest = {
  inner: {
    C: Object
  }
};
for (const {
  inner: each
} of [nest]) each.C = Symbol;
export const registered = nest.inner.C.for('a');
const thrown = {
  inner: {}
};
try {
  throw thrown;
} catch ({
  inner: caught
}) {
  caught.C = URL;
}
export const valid = thrown.inner.C.canParse('a:b');
const box = {
  inner: {
    C: Array
  }
};
function fill({
  inner: slot
} = box) {
  slot.C = Iterator;
}
fill();
export const copied = box.inner.C.from([1]);