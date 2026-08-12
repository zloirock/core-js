import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// One comma-sequence descent serves every consumer that reaches a value through a sequence tail, so
// this locks that descent where it is observable: an extends target, a member chain root, a computed
// key, a per-branch fallback, a parameter default and an IIFE callee - each on its own line with its
// own method, so no site masks another. Every prefix call must survive in the output: the descent
// classifies through the tail, it never discards what runs before it.
export class Sub extends (a(), globalThis).Array {}
export const chained = (b(), globalThis).Array.of(1, 2);
const {
  [(c(), 'from')]: made
} = Array;
export const viaKey = made([3]);
export function branch(cond) {
  const {
    flat
  } = cond ? (d(), Array.prototype) : Iterator.prototype;
  return flat;
}
export function defaulted({
  at
} = (e(), Array.prototype)) {
  return at;
}
export const viaIife = (0, () => Promise)().allSettled([]);