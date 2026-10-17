export function optionalRead(c) {
  let M;
  if (c) M = globalThis.Map;
  return M?.groupBy;
}
