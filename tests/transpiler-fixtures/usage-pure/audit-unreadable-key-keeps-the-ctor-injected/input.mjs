// an UNREADABLE mutation key names no member, so none of them is substituted on its own - but the
// ctor stays this file's own, and every surface lands on it: the delete that made the members
// unknown and the reads below it. the reads' navigation folds like any other, and an effect prefix
// beside it changes no answer; the delete keeps the `?.` over the environment probe - folded, it
// deleted off the ponyfill where the source touches nothing
let out, key;
function eff() {}
out = delete globalThis.window?.self?.Promise[key];
export const readsTheInjectedCtor = globalThis.window.self?.Promise.noSuchStatic;
export const untouchedCtorErasesTheNav = globalThis.window.self?.Map.noSuchStatic;
export const sequencePrefixKeepsTheAnswer = (eff(), globalThis.window.self)?.Map.noSuchStatic;
export { out };
