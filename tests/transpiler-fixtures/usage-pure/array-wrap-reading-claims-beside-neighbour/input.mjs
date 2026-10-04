// Reading claims beside a neighbour: the RHS and its spread run before property dispatch.
// Stable names need no capture; member reads keep one. An effectful computed key retains
// its native sentinel, while a leaf reached only through named hops stays native.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ Array: { prototype: { flat: viaSurface } } }] = [globalThis, ...xs];
const [{ Array: { prototype: { at: viaLifted } } }] = [globalThis, eff('v')];
const [{ [(eff('u'), 'at')]: viaKey }] = [Array.prototype, ...xs];
const [{ Array: { keys: nameMatch } }] = [globalThis, ...xs];
// An effectful neighbour runs before the property read. Capture the original element
// whether that neighbour binds a value or is discarded.
const [{ at: memoBeside }, boundBeside] = [globalThis.Array.prototype, eff('ad')];
const [{ at: inlineBesideEffect }] = [globalThis.Array.prototype, eff('ae')];
export { viaSurface, viaLifted, viaKey, nameMatch, memoBeside, boundBeside, inlineBesideEffect, seen };
