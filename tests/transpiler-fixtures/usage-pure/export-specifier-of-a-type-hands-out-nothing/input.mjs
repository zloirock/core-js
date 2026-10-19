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
export const pending = new globalThis.Promise(resolve => resolve(undefined));
export const tag = globalThis.Symbol('tag');
