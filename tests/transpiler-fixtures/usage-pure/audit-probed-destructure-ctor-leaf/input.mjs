// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
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
