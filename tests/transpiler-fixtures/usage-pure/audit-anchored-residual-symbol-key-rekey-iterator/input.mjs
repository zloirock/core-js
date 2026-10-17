function shadowed(Symbol) {
  const { Map: { [Symbol.iterator]: d }, Object: { fromEntries: fe4 } } = globalThis;
  return [d, fe4];
}
shadowed({ iterator: 'k' });
