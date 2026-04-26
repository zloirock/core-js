// `import { type X as Y }` is a type-only specifier - the imported `Set` name lives only
// in the type domain, must not be treated as a runtime use of the global `Set`.
import { type Set as MySet } from './shim';
type T = InstanceType<MySet>;
const t: T = null as any;
t;