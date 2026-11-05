// Constructor-leaf probes preserve the source's potentially throwing read before a static extraction.
// Aliases and seals retain their boundaries; literal-wrapper twins stay native.
export const { of: viaCtorLeaf } = globalThis.window?.Array;
export const { from: viaCtorLeafRenamed } = globalThis.window?.Array;
export const { of: viaCtorLeafDeep } = globalThis.window?.self.Array;
let viaCtorLeafCascade;
({ of: viaCtorLeafCascade } = globalThis.window?.Array);
export { viaCtorLeafCascade };
export const [{ of: viaCtorLeafWrapped }] = [globalThis.window?.Array];
const heldCtorNav = globalThis.window;
export const { of: viaCtorLeafAlias } = heldCtorNav?.Array;
export const { of: viaCtorLeafSealed } = (globalThis.window?.self).Array;
export const { a: { of: viaCtorLeafLiteral } } = { a: globalThis.window?.Array };
