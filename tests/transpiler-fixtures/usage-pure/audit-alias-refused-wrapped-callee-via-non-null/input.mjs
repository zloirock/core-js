export function viaNonNull(c) {
  let I: any;
  if (c) ({ Iterator: I } = globalThis);
  return (I.zip!)([[1], [2]]);
}
export const r = [viaNonNull(true)];
