// Iterator receivers preserve quiet navigation and root prefixes. Effectful realm keys keep their source read and independent symbol claim.
let c = 0;
const seWrapped = (c++, globalThis.self).Array.prototype[Symbol.iterator];
const computedKey = globalThis[(c++, 'self')].Array.prototype[Symbol.iterator];
const plainDeep = globalThis.self.Array.prototype[Symbol.iterator];
const real = [1][Symbol.iterator];
export { seWrapped, computedKey, plainDeep, real, c };
