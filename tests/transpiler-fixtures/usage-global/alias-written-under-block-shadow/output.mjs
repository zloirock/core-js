import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.keys";
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
import "core-js/modules/es.math.sign";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.int16-array";
import "core-js/modules/es.typed-array.of";
import "core-js/modules/es.typed-array.iterator";
import "core-js/modules/es.typed-array.at";
import "core-js/modules/es.typed-array.copy-within";
import "core-js/modules/es.typed-array.entries";
import "core-js/modules/es.typed-array.every";
import "core-js/modules/es.typed-array.fill";
import "core-js/modules/es.typed-array.filter";
import "core-js/modules/es.typed-array.find";
import "core-js/modules/es.typed-array.find-index";
import "core-js/modules/es.typed-array.find-last";
import "core-js/modules/es.typed-array.find-last-index";
import "core-js/modules/es.typed-array.for-each";
import "core-js/modules/es.typed-array.includes";
import "core-js/modules/es.typed-array.index-of";
import "core-js/modules/es.typed-array.join";
import "core-js/modules/es.typed-array.keys";
import "core-js/modules/es.typed-array.last-index-of";
import "core-js/modules/es.typed-array.map";
import "core-js/modules/es.typed-array.reduce";
import "core-js/modules/es.typed-array.reduce-right";
import "core-js/modules/es.typed-array.reverse";
import "core-js/modules/es.typed-array.set";
import "core-js/modules/es.typed-array.slice";
import "core-js/modules/es.typed-array.some";
import "core-js/modules/es.typed-array.sort";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/es.typed-array.subarray";
import "core-js/modules/es.typed-array.to-locale-string";
import "core-js/modules/es.typed-array.to-reversed";
import "core-js/modules/es.typed-array.to-sorted";
import "core-js/modules/es.typed-array.to-string";
import "core-js/modules/es.typed-array.to-string-tag";
import "core-js/modules/es.typed-array.values";
import "core-js/modules/es.typed-array.with";
import "core-js/modules/es.uint8-array.set-from-base64";
import "core-js/modules/es.uint8-array.set-from-hex";
import "core-js/modules/es.uint8-array.to-base64";
import "core-js/modules/es.uint8-array.to-hex";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global an alias written under a block that rebinds the name its value reads injects for the
// value the write saw. each row names its own static, so one resolved where the read stands would show
// the outer global's module instead: `Object.groupBy`, not `Map.groupBy`; `Iterator.from`, not
// `Array.from`; the typed-array `of` through a container slot, not `Array.of`; `Object.fromEntries`
// destructured, not a `Set` static; and a realm whose `Promise` is `Object` serves no `try` at all. the
// alias written outside any shadow keeps its global's `Math.sign`
let viaClosure;
{
  const Map = Object;
  viaClosure = Map;
}
export const groupedViaClosure = () => viaClosure.groupBy([1, 2], it => it % 2);
export function iteratedInFunction() {
  let held;
  {
    const Array = Iterator;
    held = Array;
  }
  return held.from([1, 2]);
}
let box;
{
  const Array = Int16Array;
  box = {
    A: Array
  };
}
export const ofViaContainer = () => box.A.of(1, 2);
let source;
{
  const Set = Object;
  source = Set;
}
export const destructured = () => {
  const {
    fromEntries
  } = source;
  return fromEntries([['a', 1]]);
};
let realm;
{
  const globalThis = {
    Promise: Object
  };
  realm = globalThis;
}
export const fromRealm = () => realm.Promise.try;
let unshadowed;
{
  unshadowed = Math;
}
export const signUnshadowed = () => unshadowed.sign(-2);