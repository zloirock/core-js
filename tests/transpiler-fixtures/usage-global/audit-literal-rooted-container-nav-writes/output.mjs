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
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// A fresh replacement removes the old realm candidate in either flavor.
// This also holds for bindings reached through object, array and class literals.
// Writes to unrelated keys leave the original global claims intact.
const obj = {
  h: {
    g: globalThis
  }
}.h;
obj.g = {
  Map: null
};
hand(obj.g.Map);
const box = [{
  g: globalThis
}][0];
box.g = {
  Set: null
};
hand(box.g.Set);
const statics = class {
  static h = {
    g: globalThis
  };
}.h;
statics.g = {
  WeakMap: null
};
hand(statics.g.WeakMap);
// `kept.h` is the literal's own key, above the name - the read never goes through it
const kept = {
  h: {
    g: globalThis
  }
}.h;
kept.h = elsewhere;
hand(kept.g.WeakSet);
// an unrelated slot on the very container the read descends
const aside = {
  h: {
    g: globalThis
  }
}.h;
aside.tag = 1;
hand(aside.g.Promise);