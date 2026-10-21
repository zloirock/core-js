// Function-name helpers preserve their receiver effects once.
// Effectful realm keys keep their source read; call roots, prefixes and quiet keys remain supported.
let n = 0;
const hopKey = globalThis[(n += 1, 'self')].Map.name;
const chainRoot = (() => { n += 10; return globalThis; })().self.Set.name;
const directSe = (n += 100, globalThis.self.Promise).name;
const noSe = globalThis.self.WeakMap.name;
export { hopKey, chainRoot, directSe, noSe, n };
