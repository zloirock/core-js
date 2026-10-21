import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const g = _globalThis;
const [{
  Reflect: RE
}, {
  JSON: JS
}] = [g, g];
export const viaSharedAliasFirst = _Reflect$ownKeys(target);