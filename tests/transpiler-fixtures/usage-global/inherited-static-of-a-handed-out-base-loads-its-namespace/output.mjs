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
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.find-index";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.to-spliced";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.values";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.code-point-at";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.is-well-formed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.match";
import "core-js/modules/es.string.match-all";
import "core-js/modules/es.string.raw";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/es.string.trim";
import "core-js/modules/es.string.trim-end";
import "core-js/modules/es.string.trim-left";
import "core-js/modules/es.string.trim-right";
import "core-js/modules/es.string.trim-start";
import "core-js/modules/es.string.anchor";
import "core-js/modules/es.string.big";
import "core-js/modules/es.string.blink";
import "core-js/modules/es.string.bold";
import "core-js/modules/es.string.fixed";
import "core-js/modules/es.string.fontcolor";
import "core-js/modules/es.string.fontsize";
import "core-js/modules/es.string.italics";
import "core-js/modules/es.string.link";
import "core-js/modules/es.string.small";
import "core-js/modules/es.string.strike";
import "core-js/modules/es.string.sub";
import "core-js/modules/es.string.sup";
import "core-js/modules/web.dom-collections.iterator";
// A class whose own name reads a static it inherits owes its base's whole namespace where the base has no
// constructor module of its own (`Array`, `Object`, `String`) - and still does where the base's binding leaves
// the file another way first: handed to a call, stored on an object, stored on the realm.
export function listed(items) {
  const A = Array;
  hand(A);
  class Listed extends A {}
  return Listed.from(items);
}
export function keyed(pairs) {
  const O = Object;
  sink.held = O;
  class Keyed extends O {}
  return Keyed.entries(pairs);
}
export function coded() {
  const S = String;
  globalThis.held = S;
  class Coded extends S {}
  return Coded.fromCodePoint(65);
}