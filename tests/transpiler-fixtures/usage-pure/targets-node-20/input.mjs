// `targets: { node: '20' }` filter demo:
// - `Math.tanh` / `Math.hypot` (ES6): native in Node 20 → stay bare
// - `Math.sumPrecise` (stage 3): not in Node yet → replaced with pure import
Math.tanh(0.5);
Math.hypot(3, 4);
Math.sumPrecise([1, 2, 3]);
