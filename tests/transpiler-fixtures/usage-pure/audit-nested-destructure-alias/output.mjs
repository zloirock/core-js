import _Array$from from "@core-js/pure/actual/array/from";
// Nested destructure alias `{ Array: { from } } = globalThis`. `globalThis.Array` is
// always present (native, may be buggy) so an inline `from = _Array$from` default would
// never fire — we must ALWAYS route to the polyfill. tryFlattenNestedProxyDestructure
// detects the single-chain shape (inner+outer patterns each hold one property, single
// declarator) and rewrites the whole VariableDeclaration to `const from = _Array$from`
const from = _Array$from;
from([1, 2, 3]);