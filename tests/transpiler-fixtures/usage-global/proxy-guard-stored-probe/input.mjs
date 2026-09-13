// Each stored environment navigation keeps its source spelling in usage-global. Every row
// uses a distinct static or constructor so the import set observes each claim independently.
let p, q, r, s, effects = 0;
export const terminal = (p = globalThis.self.window)?.Array.from([1]);
export const prefix = (q = (effects++, globalThis).self.window)?.Array.of(2);
export const computed = (r = globalThis.self[(effects++, 'window')])?.Object.entries({ a: 3 });
export const middle = (s = (effects++, globalThis).window.self)?.Map.length;
export const residualStatic = (p = globalThis.self.window)?.Map.length;
export { p, q, r, s, effects };
