// A shared realm alias resolves each array position independently.
// The wrapper stays native and the second binding's JSON.rawJSON call is served.
const g = globalThis;
const [{ Reflect: RE }, { JSON: JS }] = [g, g];
export const viaSharedAliasSecond = JS.rawJSON(input);
