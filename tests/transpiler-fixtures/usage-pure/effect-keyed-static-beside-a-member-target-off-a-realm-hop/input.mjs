// A static keyed by an effect between a member target and a plain slot, assigned off a probed `window` and
// off the realm: each leg keeps the source order, babel reading the constructor hop as a member while
// unplugin destructures it (the sidecar).
let f4, c4, f6, c6;
const o = {};
({ Array: { isArray: o.g, [(e(), "fromAsync")]: f4, custom: c4 } } = globalThis.window);
({ Array: { isArray: o.h, [(e(), 'of')]: f6, custom: c6 } } = globalThis);
