// a `?.` reading a value the collapse assumption DEFINES asks for no branch: a deeper unbacked hop
// is a realm self-reference, so the nav folds exactly like its `?.`-free twin and no probe guard is
// built. only a `?.` whose own object IS the environment probe - the FIRST hop off the root - keeps
// one. a sequence-rooted nav proves its alias through the write beside it, so the ctor above it
// resolves instead of reading raw off a ponyfill
let g, v, key;
export const backedLeafFolds = globalThis.window.self?.Promise.noSuchStatic;
export const deeperHopFolds = globalThis.self.window?.customKey;
export const firstHopKeepsTheProbe = globalThis.window?.self.Promise.noSuchStatic;
export const seqRootProvesItsAlias = (g = globalThis, v = g.window?.self)?.Promise.noSuchStatic;
export const seqRootDelete = delete (g = globalThis, v = g.window?.self)?.Promise[key];
export { g, v };
