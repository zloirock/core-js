import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// the global twin: nothing is memoized here, so the whole decision is which modules the key effect
// and its consumer pull in - the control for the pure side, where the same effect is folded into a
// memo. a DISTINCT effect call and a DISTINCT consumer per row keep every module attributable
const log = [];
const arr = [1, [2]];
export const viaMemoFold = globalThis[log.push('a'), 'Map'].name;
let held;
export const viaChainAssignRoot = (held = globalThis)[arr.flat().length, 'Set'].size;

// the same shape under consumers that do NOT fold the effect into a memo
export const viaPrototypeRead = globalThis[arr.includes(1), 'WeakMap'].prototype;
export const viaPlainReceiver = arr[arr.flatMap(x => [x]).length, 'at'](0);

// NEGATIVE: an effect with nothing polyfillable inside it has nothing to keep alive
let n = 0;
export const viaPlainEffect = globalThis[n++, 'Promise'].name;
export const effects = log;