import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// A dispatch memo retains the sequence receiver and its alias writes before the member read.
// Known constructors below that receiver use their pure imports; an unwritten key needs
// the constructor alone. The sequence write still dominates the sibling read.
let g, v, key;
export const seqRootMemo = null == (g = _globalThis, v = null == _globalThis.window ? void 0 : _self) ? void 0 : _at(_Promise[key]);
export const seqPrefixMemo = null == (log(), null == _globalThis.window ? void 0 : _self) ? void 0 : _at(_Promise[key]);
export const aliasWrittenBeside = null == (g = _globalThis, v = null == g.window ? void 0 : _self) ? void 0 : _at(_Promise[key]);
function log() {}
export { g, v };