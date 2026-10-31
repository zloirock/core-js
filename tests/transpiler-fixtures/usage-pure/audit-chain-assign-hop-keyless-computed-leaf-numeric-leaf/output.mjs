import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a chain-assign root navigating a proxy hop into a KEYLESS computed leaf: the hop-root
// collapse owns the whole span (assign folds, hop drops, the key stays raw) - the swallowed
// hop must not fire its own value-canon claim (a `.self` -> ponyfill swap racing the span),
// and a get-iterator leaf is owned by the instance dispatch that queued first
let x;
export const numericLeaf = (x = _globalThis, _self)[0];