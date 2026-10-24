import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// mixed import: `import { Map, type Set, type WeakMap }` - `Map` is a runtime binding
// (real shadow), `Set`/`WeakMap` are type-only (tsc-elided). per-specifier `importKind`
// distinguishes them; runtime binding shadows polyfill, type-only specifiers don't
import { Map, type Set, type WeakMap } from "./shapes";
export const a = new Map();
// @ts-expect-error a type-only import read as a value is the shape under test
export const b = new _Set();
// @ts-expect-error a type-only import read as a value is the shape under test
export const c = new _WeakMap();