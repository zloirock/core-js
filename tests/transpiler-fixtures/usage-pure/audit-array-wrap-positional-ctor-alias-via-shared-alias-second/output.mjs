import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$rawJSON from "@core-js/pure/actual/json/raw-json";
// A shared realm alias resolves each array position independently.
// The wrapper stays native and the second binding's JSON.rawJSON call is served.
const g = _globalThis;
const [{
  Reflect: RE
}, {
  JSON: JS
}] = [g, g];
export const viaSharedAliasSecond = _JSON$rawJSON(input);