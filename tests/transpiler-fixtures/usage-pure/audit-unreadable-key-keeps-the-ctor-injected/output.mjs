import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
// an UNREADABLE mutation key names no member, so none of them is substituted on its own - but the
// ctor stays this file's own, and every surface lands on it: the delete that made the members
// unknown and the reads below it. the navigation around them folds like any other (its `?.` reads a
// value the collapse assumption defines), and an effect prefix beside it changes no answer
let out, key;
function eff() {}
out = delete _Promise[key];
export const readsTheInjectedCtor = _Promise.noSuchStatic;
export const untouchedCtorErasesTheNav = _Map.noSuchStatic;
export const sequencePrefixKeepsTheAnswer = (eff(), _Map).noSuchStatic;
export { out };