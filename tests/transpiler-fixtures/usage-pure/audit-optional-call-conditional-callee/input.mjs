// a CONDITIONALLY-assigned optional callee short-circuits through its own `?.()`: the yield is
// a source of undefined nothing above re-tests, so every claim channel keeps a test on the call
// value. an UNCONDITIONAL callee keeps its collapse (the link is proven-defined), and the plain
// call keeps its own throw. the delete row targets a ctor no other row here claims - a deleted
// slot deoptimizes its name for the whole file
let condFn;
if (globalThis.setTimeout) condFn = () => globalThis;
export const condCalleeStaticCall = condFn?.()?.Array.of(12);
export const condCalleeStaticRead = condFn?.()?.Array.of;
export const condCalleeStaticField = condFn?.()?.Number.MAX_SAFE_INTEGER;
export const condCalleeTypeof = typeof condFn?.()?.Array.of;
export const condCalleeWellKnown = condFn?.()?.Symbol.iterator;
export const condCalleeDeepHop = condFn?.()?.self.Array.of(13);
export const { of: condCalleeDestructured } = condFn?.()?.Array ?? {};
export const condCalleePlainCall = globalThis.setTimeout ? condFn()?.Array.of(14) : null;
export const condCalleeInstanceMemo = condFn?.()?.Array.prototype.at.call([7], 0);
export const condCalleeDelete = delete condFn?.()?.Map.groupBy;
const condNavFn = () => globalThis.window;
export const optionalNavCalleeGuard = condNavFn?.()?.Array.of(15);

// controls: the proven twin collapses, exactly as the opaque-root family locks it
const provenFn = () => globalThis;
export const provenCalleeCollapse = provenFn?.()?.Array.of(16);
