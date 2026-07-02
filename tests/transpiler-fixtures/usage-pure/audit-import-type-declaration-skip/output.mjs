import _Array$from from "@core-js/pure/actual/array/from";
// `import type X` is type-only and stays as-is (skipped from polyfill processing).
// runtime `Array.from` call still resolves to its static-method polyfill
import type X from '@core-js/pure/actual/array/from';
_Array$from([1, 2]);