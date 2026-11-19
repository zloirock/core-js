// A captured constructor selected as a full index supplies its own static reads.
// A same-named parameter still supplies its caller's properties.
consume(Promise);
const { Promise: Captured } = globalThis;
const { all } = Captured;
export const methods = [all, Captured.race];
export function shadow(Captured) {
  const { all } = Captured;
  return all;
}
