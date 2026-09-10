import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.has-instance";
import "core-js/modules/es.symbol.is-concat-spreadable";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.key-for";
import "core-js/modules/es.symbol.match";
import "core-js/modules/es.symbol.match-all";
import "core-js/modules/es.symbol.replace";
import "core-js/modules/es.symbol.search";
import "core-js/modules/es.symbol.species";
import "core-js/modules/es.symbol.split";
import "core-js/modules/es.symbol.to-primitive";
import "core-js/modules/es.symbol.to-string-tag";
import "core-js/modules/es.symbol.unscopables";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.date.to-primitive";
import "core-js/modules/es.function.has-instance";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.json.to-string-tag";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a member nav whose chain starts at the container LITERAL itself folds into the receiver walk
// exactly as one rooted at a NAME does: the walk descends the literal either way, so the keys in
// front of the container are part of the path rather than a reason to stop. every root the walk can
// stand on reaches - an object literal, an array literal, a class expression's statics, a
// transparent sequence around one, and the literal read with no binding between it and the use.
// the two negatives pin the boundary: an effect in front of the sequence leaves the nav unfoldable
// in both flavors, while a slot this file REPLACED is method-aware like every other written-slot
// consult - pure leaves the read native, global over-injects for it. the escape census reads the
// replacement either way, so the read lands on what the write installed and owes no family
const obj = {
  h: {
    g: globalThis
  }
}.h;
hand(obj.g.Map);
const box = [{
  g: globalThis
}][0];
hand(box.g.Set);
const deep = {
  a: {
    b: {
      g: globalThis
    }
  }
}.a.b;
hand(deep.g.WeakMap);
const statics = class {
  static h = {
    g: globalThis
  };
}.h;
hand(statics.g.WeakSet);
const seq = (0, {
  h: {
    g: globalThis
  }
}).h;
hand(new seq.g.Promise(executor));
// no binding at all between the literal and the read
hand({
  h: {
    g: globalThis
  }
}.h.g.Reflect);
// the replaced slot: the literal no longer says what `rep.g` holds
const rep = {
  h: {
    g: globalThis
  }
}.h;
rep.g = {
  URL: null
};
hand(rep.g.URL);
// an effect in front of the sequence changes WHEN the container is built, never WHICH one it is -
// the nav folds through it like its effect-free twin, in the bound spelling and in place alike
const eff = (note(), {
  h: {
    g: globalThis
  }
}).h;
hand(eff.g.Symbol);
hand((note(), {
  h: {
    g: globalThis
  }
}).h.g.Number);