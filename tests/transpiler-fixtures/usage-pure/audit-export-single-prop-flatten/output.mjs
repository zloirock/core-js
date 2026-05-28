import _Array$from from "@core-js/pure/actual/array/from";
// single-prop export flatten: `export const { Array: { from } } = globalThis;` -
// extraction collapses to `export const from = _Array$from;` with the original
// ExportNamedDeclaration wrapper fully consumed (no residual destructure)
export const from = _Array$from;
from([1, 2]);