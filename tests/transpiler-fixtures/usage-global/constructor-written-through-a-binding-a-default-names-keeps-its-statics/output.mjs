import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.define-getter";
import "core-js/modules/es.object.define-setter";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.lookup-getter";
import "core-js/modules/es.object.lookup-setter";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
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
// a binding whose default is a container's path stands for that path where the default fires - a parameter's
// own default, one inside its pattern, a catch parameter's, a declarator pattern's - so a constructor written
// through it lands on the container, and a static read back through the path owes its family
const first = {
  inner: {
    C: Object
  }
};
function fill(slot = first.inner) {
  slot.C = Map;
}
fill();
export const grouped = first.inner.C.groupBy([1], x => x);
const second = {
  inner: {
    C: Object
  }
};
function put({
  slot = second.inner
} = {}) {
  slot.C = Promise;
}
put();
export const settled = second.inner.C.allSettled([]);
const third = {
  inner: {
    C: Object
  }
};
try {
  throw {};
} catch ({
  slot = third.inner
}) {
  slot.C = Symbol;
}
export const registered = third.inner.C.for('a');
const fourth = {
  inner: {
    C: Object
  }
};
const {
  slot = fourth.inner
} = {};
slot.C = URL;
export const valid = fourth.inner.C.canParse('a:b');