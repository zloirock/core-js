// Stored terminal probes retain their value across quiet keys and sequence prefixes.
// Effectful realm keys keep the source read before the store.
let p, q, r, s, effects = 0;
export const terminal = (p = globalThis.self.window)?.Array.from([1]);
export const prefix = (q = (effects++, globalThis).self.window)?.Array.of(2);
export const computed = (r = globalThis.self[(effects++, 'window')])?.Object.entries({ a: 3 });
export const middle = (s = (effects++, globalThis).window.self)?.Map.length;
export const residualStatic = (p = globalThis.self.window)?.Map.length;
export { p, q, r, s, effects };
