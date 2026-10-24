import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// An unknown computed key ahead of a claim under a realm hop keeps the residual the source wrote, reading the
// realm's own slot, and the claim binds after it - in source order, alike in both legs.
let v, f;
({
  [k]: v
} = _globalThis.Array);
f = _Array$of;
export { v, f };