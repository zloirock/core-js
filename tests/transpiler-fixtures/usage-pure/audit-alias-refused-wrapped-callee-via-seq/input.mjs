export function viaSeq(c) {
  let P;
  if (c) ({ Promise: P } = globalThis);
  return (0, P.try)(() => 1);
}
export const r = [viaSeq(true)];
