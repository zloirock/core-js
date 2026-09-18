// Every branch returns the same free constructor. Keep branch effects and inject its static.
export const value = (() => {
  const local = flag;
  if (local) {
    observe('yes');
    return Map;
  }
  observe('no');
  return Map;
})().groupBy([1, 2], value => value % 2);
