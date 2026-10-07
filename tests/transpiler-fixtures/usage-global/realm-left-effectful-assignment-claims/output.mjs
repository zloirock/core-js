import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.key-for";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.of";
import "core-js/modules/es.data-view.get-float16";
import "core-js/modules/es.data-view.set-float16";
import "core-js/modules/es.data-view.to-string-tag";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.int8-array";
import "core-js/modules/es.typed-array.from";
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
// A destructuring ASSIGNMENT whose init runs code over a `||` / `??` left read off the realm: a left the
// build serves (`Array`, `Object`, and `Number`, which core-js extends in place) leaves its right dead, which
// injects nothing; one it does not (`Int8Array`, whose statics live under the shared typed-array entries;
// `WeakRef`) keeps the right live: the static read off the selection - the left's own, or the right's
// (`keyFor`) - keeps its module beside the right's constructor, in a bodyless slot and in a sequence element too.
let of, fromEntries, from;
({
  of
} = globalThis.Array || (log(), Set));
if (ok) ({
  fromEntries
} = globalThis.Object || (log(), WeakMap));
export const pair = ({
  from
} = globalThis.Array ?? make(), from([1, 2]));
let fromAsync;
if (ok) ({
  fromAsync
} = (log(), globalThis.Array || Map));
export { of, fromEntries, from, fromAsync };
let isInteger, isFinite, parseFloat;
({
  isInteger
} = globalThis.Number || (log(), WeakSet));
if (ok) ({
  isFinite
} = globalThis.Number || (log(), Iterator));
export const parsed = ({
  parseFloat
} = globalThis.Number ?? (make(), DisposableStack), parseFloat('1'));
export { isInteger, isFinite };
let int8Of, int8From, keyFor;
({
  of: int8Of
} = globalThis.Int8Array || (log(), AggregateError));
if (ok) ({
  from: int8From
} = globalThis.Int8Array || (log(), DataView));
export const symbolKey = ({
  keyFor
} = globalThis.WeakRef ?? (make(), Symbol), keyFor(sym));
export { int8Of, int8From };