export function twoWrites(c) {
  let W;
  if (c) W = globalThis.Map;
  if (!c) W = globalThis.WeakMap;
  return W.groupBy;
}
