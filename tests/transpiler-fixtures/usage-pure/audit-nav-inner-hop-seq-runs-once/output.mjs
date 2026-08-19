import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// a sequence prefix on an INNER hop of a sealed nav sits inside the span the guard test re-emits
// from source, so spelling it ahead of the probe too ran the effect twice (`(n++, (null == (n++,
// _globalThis.window).self ? void 0 : window).Array)`). the render reports what it re-emits and the
// probe spells only the rest; it still REPORTS every prefix, so no other channel repeats one.
// the corpus cannot hold these: native THROWS on them, and a throwing native is vacuous there.
// the PROBE owns a sequence root - and only the probe: it re-emits the peeled prefix through its own
// channel and keeps the sealed read, so the plan may descend past the sequence tail for it. a kept-nav
// flush asking for the same shape lost first that prefix effect and then the read's throw, which is
// why the descent is the caller's opt-in rather than the plan's default.
let n = 0;
let w;
export const innerHopSeq = (n++, (null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(5);
export const innerHopSeqOptionalTail = (n++, (null == _globalThis.window ? void 0 : _self.window).Array, _Array$of)(5);
// the same prefix a hop below, where the test's span stops short of it - always spelled ahead.
// the seal over its plain proxy-hop read is the collapse's own accepted price, not a stand-down:
// asking for a short-circuit instead of any sealed read is what lets the claim be polyfilled here
export const innerHopSeqBelowTest = (n++, _Promise$resolve)(1);
// NEGATIVE: the sequence on the ROOT hop, outside every rendered span - spelled ahead as before
export const rootHopSeq = (n++, (null == _globalThis.window ? void 0 : _self).Array, _Array$of)(5);
// NEGATIVE: a kept write on the root hop rides the test itself, and its prefix rides ahead of it
export const rootHopSeqWrite = (n++, (null == (w = _globalThis.window) ? void 0 : _self).Array, _Array$of)(5);
// NEGATIVE: no sequence at all - nothing to spell on either side
export const noSeq = _Array$of(5);