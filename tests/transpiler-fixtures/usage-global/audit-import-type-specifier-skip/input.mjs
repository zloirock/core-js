// `import { type X }` is type-only and must not trigger a polyfill for `X`.
import { type Set as MySet } from './shim';
type T = InstanceType<MySet>;
const t: T = null as any;
t;
