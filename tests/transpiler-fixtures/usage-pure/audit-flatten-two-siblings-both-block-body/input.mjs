// flatten + TWO sibling block-body IIFEs, each with its own instance method requiring
// `_ref` injection. consumeRefBindingsInRange must scope binding consumption to each
// sibling's range independently - cross-pollution would inject _ref into wrong sibling
const { Array: { from } } = globalThis,
  kls1 = (() => { return [].values(); })(),
  kls2 = (() => { return [].keys(); })();
export { from, kls1, kls2 };
