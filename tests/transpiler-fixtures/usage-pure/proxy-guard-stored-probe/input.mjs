// A stored terminal environment probe survives the ponyfill of its base. The outer optional
// tests that stored value; prefixes and computed keys run once before the test. A plain
// middle hop ending at a backed leaf collapses without inventing a source guard.
let p, q, r, s, effects = 0;
export const terminal = (p = globalThis.self.window)?.Array.from([1]);
export const prefix = (q = (effects++, globalThis).self.window)?.Array.of(2);
export const computed = (r = globalThis.self[(effects++, 'window')])?.Object.entries({ a: 3 });
export const middle = (s = (effects++, globalThis).window.self)?.Map.length;
export const residualStatic = (p = globalThis.self.window)?.Map.length;
export { p, q, r, s, effects };
