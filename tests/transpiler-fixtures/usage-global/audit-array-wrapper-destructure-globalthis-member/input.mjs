// ArrayPattern-wrapped destructure whose element is a proxy-global member access
// (`[globalThis.Array]`); the `from` receiver resolves through the member chain to `Array`,
// so the dep must be injected just like a bare `const { from } = globalThis.Array`
const [{ from }] = [globalThis.Array];
from([1, 2, 3]);
