// a `?.` reading a value the collapse assumption DEFINES asks for no branch: a deeper unbacked hop is
// a realm self-reference, so the nav folds like its `?.`-free twin. only a `?.` whose own object IS the
// environment probe - the FIRST hop off the root - keeps a guard. a sequence-rooted nav proves its alias
// through the write beside it, so the ctor above it resolves; the delete row's ctor is its own, since a
// deleted slot deoptimizes its name for the whole file
let g, v, key;
export const backedLeafFolds = globalThis.window.self?.Map.noSuchStatic;
export const deeperHopFolds = globalThis.self.window?.customKey;
export const firstHopKeepsTheProbe = globalThis.window?.self.Set.noSuchStatic;
export const seqRootProvesItsAlias = (g = globalThis, v = g.window?.self)?.WeakMap.noSuchStatic;
// ... and under `delete` the `?.` ABOVE that sequence decides whether the delete happens: it becomes
// the guard's test, and the delete rides the alternate
export const seqRootDelete = delete (g = globalThis, v = g.window?.self)?.Promise[key];
export { g, v };
