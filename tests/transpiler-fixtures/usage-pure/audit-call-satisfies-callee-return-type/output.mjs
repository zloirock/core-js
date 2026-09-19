import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// callee wrapped in TS satisfies: parallel to TSAsExpression. the call-return-type
// resolver's gated ambient lookup must let non-Identifier callees fall through to
// the annotation-based call-return resolution, which handles all TS expression wrappers
declare const fn: () => number[];
const r = (fn satisfies () => number[])();
_includesMaybeArray(r).call(r, 1);