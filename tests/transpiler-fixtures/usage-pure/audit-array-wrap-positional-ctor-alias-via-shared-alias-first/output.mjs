import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A shared realm alias resolves each array position independently.
// The wrapper stays native and the first binding's Reflect.ownKeys call is served.
const g = _globalThis;
const [{
  Reflect: RE
}, {
  JSON: JS
}] = [g, g];
export const viaSharedAliasFirst = _Reflect$ownKeys(target);