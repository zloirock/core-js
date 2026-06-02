// ArrayPattern-wrapped destructure whose element is a proxy-global member access
// (`[globalThis.Array]`); the `from` receiver resolves through the member chain to `Array`,
// so it must substitute to the pure static import just like `const { from } = globalThis.Array`
const [{ from }] = [globalThis.Array];
from([1, 2, 3]);
