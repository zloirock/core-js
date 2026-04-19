// `import { type X }` — type-only import. identifier at ImportSpecifier position must
// not trigger polyfill injection via `isTSTypeOnlyIdentifier` (importKind='type' guard)
import { type Set as MySet } from './shim';
type T = InstanceType<MySet>;
const t: T = null as any;
t;