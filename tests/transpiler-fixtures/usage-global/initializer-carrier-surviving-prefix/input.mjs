// A surviving binding and the extracted read share the initializer.
const { Array: { prototype: { at: method } }, other } = (effect(), globalThis);
use(method, other);
