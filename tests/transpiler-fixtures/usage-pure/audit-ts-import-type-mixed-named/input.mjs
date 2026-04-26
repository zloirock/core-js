// mixed import: `import { Map, type Set, type WeakMap }` - `Map` is a runtime binding
// (real shadow), `Set`/`WeakMap` are type-only (tsc-elided). per-specifier `importKind`
// distinguishes them; runtime binding shadows polyfill, type-only specifiers don't
import { Map, type Set, type WeakMap } from "./shapes";
export const a = new Map();
export const b = new Set();
export const c = new WeakMap();
