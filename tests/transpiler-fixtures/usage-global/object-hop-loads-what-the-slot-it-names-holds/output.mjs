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
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a sole-key object hop reads the value standing in the slot it names - a literal's, a container alias's,
// a pure getter's return, either arm of a selection - so usage-global loads the constructor or the static
// the leaf names there
const other = {};
const {
  w: {
    Map: hopCtor
  }
} = {
  w: globalThis
};
const src = {
  P: Array
};
const {
  P: {
    from: hopStatic
  }
} = src;
const {
  w: {
    WeakMap: hopThroughGetter
  }
} = {
  get w() {
    return globalThis;
  }
};
const {
  w: {
    Promise: viaBranch
  }
} = {
  w: other ? globalThis : globalThis
};
export default [hopCtor, hopStatic, hopThroughGetter, viaBranch];