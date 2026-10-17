// the receiver of an instance dispatch off a proxy nav is memoized, and the memo is where the nav's
// collapse lands. a KEPT chain-assign keeps the probe read, and the plain hop above it throws
// off-window, so the guard tests the hop's value rather than sliding onto the probe; a resolving nav
// memoizes the collapsed root, and a `window` below `self` folds into it as the realm itself.
let w;
export const keptAssignPlainHop = ((w = globalThis.window)).self?.Array?.prototype.flat.name;
export const keptAssignDelete = delete ((w = globalThis.window)).self?.Array?.prototype.flatMap.name;
export const resolvingNav = globalThis.self?.Array?.prototype.findLast.name;
export const deepProbeNav = globalThis.self.window?.Array?.prototype.findLastIndex;
export const loweredScaffoldDelete = delete ((globalThis.window?.self)?.Array?.prototype.toSorted.name);
export { w };
