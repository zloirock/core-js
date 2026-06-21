// an EXPORTED side-effecting computed key. the extracted polyfill emits as its own
// `export const f`, and the residual destructure keeps its own export, so both `f` and the
// effect-running destructure stay exported. guards two past regressions: a dangling
// `export eff();` syntax error, and a binding inserted between `export` and `const`.
export const { [(effectful(), 'from')]: f } = Array;
