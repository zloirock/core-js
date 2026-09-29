import _Map from "@core-js/pure/actual/map";
// Ordinary and guarded reads share a synthesized source, but not their cache domain.
function read(flag) {
  const M = _Map;
  const box = {
    x: flag ? M : Math
  };
  const first = 'groupBy' in box.x;
  let C = M;
  if (flag) C = Math;
  return [first, 'groupBy' in C];
}
export const result = [read(true), read(false)];