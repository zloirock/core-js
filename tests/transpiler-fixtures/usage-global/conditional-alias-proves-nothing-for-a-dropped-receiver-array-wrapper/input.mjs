export function arrayWrapper(flag) {
  if (flag) { var G = globalThis; }
  const [{ Array: { from } }] = [G];
  return from([4]);
}
