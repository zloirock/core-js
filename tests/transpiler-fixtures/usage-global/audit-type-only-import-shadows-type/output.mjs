import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// a type-only import is elided by tsc, so in VALUE space the name still resolves to the global -
// but in TYPE space that import IS the shadow and the annotation names the imported type instead.
// each line takes its own global because the import set is the only observable here: Set is the
// shadowed type, Map is read through `typeof` (a runtime binding the elided import never provides)
// and WeakSet is constructed, so only Set's polyfills may be missing from the set below
import type { Set } from 'immutable';
import type { Map } from 'immutable';
import type { WeakSet } from 'immutable';
declare const shadowed: Set<number>;
declare const runtimeQuery: typeof Map;
export const a = shadowed;
export const b = runtimeQuery;
export const c = new WeakSet();