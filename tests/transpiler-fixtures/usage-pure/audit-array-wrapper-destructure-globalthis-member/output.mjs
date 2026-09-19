import _Array$from from "@core-js/pure/actual/array/from";
// ArrayPattern-wrapped destructure whose element is a proxy-global member access
// (`[globalThis.Array]`); the `from` receiver resolves through the member chain to `Array`,
// so it must substitute to the pure static import just like `const { from } = globalThis.Array`
const from = _Array$from;
from([1, 2, 3]);