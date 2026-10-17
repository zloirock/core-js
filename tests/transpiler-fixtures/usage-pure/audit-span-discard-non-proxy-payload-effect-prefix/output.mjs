import _Array$of from "@core-js/pure/actual/array/of";
function eff() {
  return 0;
}
// the receiver an emit RE-EMITS keeps its own rewrites: a harvested effect rides ahead of the
// binding, so the read inside it still resolves
export const effectPrefix = (eff(), _Array$of)(4);