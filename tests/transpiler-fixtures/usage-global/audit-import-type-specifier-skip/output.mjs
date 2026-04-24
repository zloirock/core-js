// `import { type X }` - type-only import. identifier at ImportSpecifier position must
// not trigger side-effect polyfill injection for X constructor
import { type Set as MySet } from './shim';
type T = InstanceType<MySet>;
const t: T = null as any;
t;