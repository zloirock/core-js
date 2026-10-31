import _globalThis from "@core-js/pure/actual/global-this";
import _Math$f16round from "@core-js/pure/actual/math/f16round";
// `const {Math: M} = globalThis` binds `M` to `globalThis.Math`. the receiver-step walk
// used to read the binding init directly (`globalThis`), losing the `Math` step, so
// `const {f16round} = M` resolved `f16round` on globalThis not Math; the destructure-key
// must be prepended. a parallel path covers the emit, so output is unchanged - walk now correct.
const {
  Math: M
} = _globalThis;
const f16round = _Math$f16round;
const x = f16round(1.5);