// An effectful prefix on the receiver runs once, ahead of the whole guard.
export const prefixLog = [];
export function seqPrefix(flag) {
  if (flag) { var realm = globalThis; }
  return (prefixLog.push('r'), realm)?.Map.groupBy;
}
