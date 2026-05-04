// nested proxy-global destructure with RestElement: `const { Array: { from }, ...rest } = globalThis`.
// flatten body-extract emits `const from = _Array$from;` and rewrites outer pattern.
// alias registration through nested-proxy path keeps receiver narrowing intact for the
// extracted `from` binding. distinct methods per line
const { Array: { from }, ...rest } = globalThis;
const xs = from('hi');
xs.at(0);
xs.includes('h');
xs.flat();
