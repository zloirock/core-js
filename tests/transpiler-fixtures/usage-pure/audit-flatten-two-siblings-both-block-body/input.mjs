// Two sibling IIFEs retain separate local receiver temporaries and their own instance polyfills.
const { Array: { from } } = globalThis,
  kls1 = (() => { return [].values(); })(),
  kls2 = (() => { return [].keys(); })();
export { from, kls1, kls2 };
