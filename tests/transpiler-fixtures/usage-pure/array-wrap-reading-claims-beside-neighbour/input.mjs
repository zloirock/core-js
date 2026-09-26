// Reading claims beside a neighbour: a spread keeps its native wrapper, while a finite literal
// captures the element before dispatch. An effectful computed key retains its native sentinel;
// a leaf reached only through named hops stays native. Re-readable elements are captured when
// their neighbours would otherwise move ahead of the property read.
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
