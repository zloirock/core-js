// A SEAL makes the source read the short-circuited value: the native throw is kept.
export function sealedChain(flag) {
  if (flag) { var realm = globalThis; }
  return (realm?.Map).groupBy;
}
