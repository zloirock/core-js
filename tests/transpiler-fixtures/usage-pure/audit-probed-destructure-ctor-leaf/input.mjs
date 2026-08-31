// CTOR-LEAF probe navs: the init's VALUE decides the probe, not its leaf NAME - a constructor
// leaf discards through the same full-consume gate, and the probe reads the first key off the
// two-halves guard (the erase verdict's `?.` object as the test, the ctor ponyfill alternate)
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
