// An inline call returning the proxy global reaches a static through an optional window hop.
// The guard preserves root evaluation and short-circuiting before the static call or field read.
// The guarded static resolves to its ponyfill before the outer instance dispatch.
const f = () => globalThis;
export const viaGuardedStaticCall = f()?.window?.Array.of(5).at(0);
