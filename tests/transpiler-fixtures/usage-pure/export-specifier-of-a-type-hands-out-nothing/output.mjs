import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
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
export const table = new _Map();
export const pending = new _Promise(resolve => resolve(undefined));
export const tag = _Symbol('tag');