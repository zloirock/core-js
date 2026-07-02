// TS wrappers around a refused-alias receiver are transparent: the cast / non-null peels to the
// bare identifier and the member read stays raw exactly like the unwrapped form
function viaCast(c: boolean) {
  let M: any;
  if (c) ({ Map: M } = globalThis);
  return typeof (M as any).groupBy;
}
function viaNonNull(c: boolean) {
  let P: any;
  if (c) ({ Promise: P } = globalThis);
  return typeof P!.try;
}
export const r = [viaCast(true), viaNonNull(true)];
