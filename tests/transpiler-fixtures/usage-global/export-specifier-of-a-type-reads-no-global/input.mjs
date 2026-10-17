// an export specifier names a declaration of this file - only those export - so where no value binding
// stands behind it, it names a type: an interface, a type alias or a type-only import exports as written
// and reads no global of its name, whichever of them declares it
import type { Set } from './set';
import { type WeakMap } from './weak-map';
interface Promise {
  pending: true;
}
type Map = Record<string, unknown>;
export { Promise, Map, Set, WeakMap };
