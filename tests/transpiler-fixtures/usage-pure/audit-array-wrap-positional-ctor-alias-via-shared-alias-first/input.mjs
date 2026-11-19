// A shared realm alias resolves each array position independently.
// The wrapper stays native and the first binding's Reflect.ownKeys call is served.
const g = globalThis;
const [{ Reflect: RE }, { JSON: JS }] = [g, g];
export const viaSharedAliasFirst = RE.ownKeys(target);
