// Different return values and an implicit undefined never prove one constructor.
// Capture the result once and use the polyfill only when its constructor identity matches.
export const mixed = (() => {
  if (flag) return Array;
  return custom;
})().of(3);
export const absent = (() => {
  if (flag) return Object;
})()?.groupBy([1, 2], value => value % 2);
