import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
// an UNREADABLE mutation key names no member, so none of them is substituted on its own - but the
// ctor stays this file's own, and every surface lands on it: the delete that made the members
// unknown and the reads below it. the reads' navigation folds like any other, and an effect prefix
// beside it changes no answer; the delete keeps the `?.` over the environment probe - folded, it
// deleted off the ponyfill where the source touches nothing
let out, key;
function eff() {}
out = delete (null == _globalThis.window ? void 0 : _Promise)?.[key];
export const readsTheInjectedCtor = _Promise.noSuchStatic;
export const untouchedCtorErasesTheNav = _Map.noSuchStatic;
export const sequencePrefixKeepsTheAnswer = (eff(), _Map).noSuchStatic;
export { out };