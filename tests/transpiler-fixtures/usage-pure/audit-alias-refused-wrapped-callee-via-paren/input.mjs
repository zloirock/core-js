export function viaParen(c) {
  let P2;
  if (c) ({ Promise: P2 } = globalThis);
  return (P2.allSettled)([1, 2]);
}
export const r = [viaParen(true)];
