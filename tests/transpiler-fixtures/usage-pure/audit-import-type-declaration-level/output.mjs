// declaration-level `import type { X }` is type-only; the imported `Set` lives only in
// the type domain, must not be treated as a runtime use of the global `Set`.
import type { Set } from './types';
declare const x: Set<number>;
x.size;