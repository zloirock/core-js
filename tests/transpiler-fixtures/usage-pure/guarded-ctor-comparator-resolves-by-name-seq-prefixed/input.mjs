export function seqPrefixed(c, n) {
  let M;
  if (c) M = globalThis.Map;
  return (n++, M).groupBy;
}
