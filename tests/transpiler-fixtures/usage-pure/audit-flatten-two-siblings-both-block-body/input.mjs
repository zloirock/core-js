// Two sibling block-body IIFEs each need their own `_ref` ; binding consumption must stay scoped per range.
// Cross-pollution would inject `_ref` into the wrong sibling and break both call sites.
const { Array: { from } } = globalThis,
  kls1 = (() => { return [].values(); })(),
  kls2 = (() => { return [].keys(); })();
export { from, kls1, kls2 };
