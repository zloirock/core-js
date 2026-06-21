// `const {Math: M} = globalThis` binds `M` to `globalThis.Math`. the receiver-step walk
// used to read the binding init directly (`globalThis`), losing the `Math` step, so
// `const {f16round} = M` resolved `f16round` on globalThis not Math; the destructure-key
// must be prepended. a parallel path covers the emit, so output is unchanged - walk now correct.
const { Math: M } = globalThis;
const { f16round } = M;
const x = f16round(1.5);
