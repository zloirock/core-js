// a MUTATED proxy hop keeps the chain raw AND the type channel drops to the generic
// dispatcher (a type-specific helper would dispatch pristine array methods on the fake)
globalThis.self = { Array: FakeArray };
const arr = new globalThis.self.Array(3);
use(arr.at(0), arr.includes(2));
export { arr };
