const { Array: { from } } = globalThis, { at } = (() => {
  return [1].concat([2]);
})();
export { from, at };
