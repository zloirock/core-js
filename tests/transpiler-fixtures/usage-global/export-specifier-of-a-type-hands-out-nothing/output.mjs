import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an export specifier naming a type hands out no value - the compiler erases it, whether the export,
// the specifier or the binding alone says so - so the global sharing its name keeps its narrow entry,
// even where the name also binds an imported value
import { Map } from './map';
import { Symbol } from './symbol';
interface Promise {
  pending: true;
}
export type { Map };
export { Promise, type Symbol };
export const table = new globalThis.Map();
export const pending = new globalThis.Promise(resolve => resolve());
export const tag = globalThis.Symbol('tag');