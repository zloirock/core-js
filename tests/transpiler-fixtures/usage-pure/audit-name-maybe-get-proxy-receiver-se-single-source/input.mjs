// A proxy-global receiver carries its side effects into the function-name read exactly once.
// The helper consumes one receiver argument, so the effects stay inside it without a memo or
// a duplicate prefix. A chain-root call keeps its own global rewrite. The rows cover a hop key,
// an inline call root, a top-level sequence and an effect-free control.
let n = 0;
const hopKey = globalThis[(n += 1, 'self')].Map.name;
const chainRoot = (() => { n += 10; return globalThis; })().self.Set.name;
const directSe = (n += 100, globalThis.self.Promise).name;
const noSe = globalThis.self.WeakMap.name;
export { hopKey, chainRoot, directSe, noSe, n };
