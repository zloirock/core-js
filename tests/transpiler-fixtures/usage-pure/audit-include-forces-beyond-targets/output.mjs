import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// `include` (entry-path form on pure) FORCES substitution beyond targets in every emitting
// channel: statics, instance methods, iterator-method helper reads, well-known symbols and
// constructors all substitute although the targets support them natively
export const viaStatic = _Array$from(items);
export const viaInstance = _at(list).call(list, 0);
export const viaHelper = _getIteratorMethod(arr);
export const viaWellKnown = _Symbol$asyncIterator;
export const viaConstructor = new _Map(pairs);

// NEGATIVE control: a method NOT listed keeps the targets decision (natively supported -> raw)
export const notIncluded = Object.groupBy(items, keyFn);