// A wrapped optional callee uses the identity guard and retains caller-side this on the raw branch.
export function viaOptional(c) {
  let O;
  if (c) ({ Object: O } = globalThis);
  return (O.groupBy)?.([1, 2], x => x % 2);
}
export const r = [viaOptional(true)];
