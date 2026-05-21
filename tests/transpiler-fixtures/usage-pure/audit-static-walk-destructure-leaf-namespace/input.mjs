// destructure-leaf binding: `const {Math: M} = globalThis` binds `M` to `globalThis.Math`.
// walkStaticReceiverStep read `binding.path.node.init` directly which gives `globalThis`
// (the source), losing the property step. then `const {f16round} = M` walks M, dereferences
// to globalThis, and looks up `f16round` on globalThis instead of Math.f16round - chain
// returns wrong receiver. id-Pattern branch + findShorthandKey prepends the matching
// destructure-key (`Math`) to walkPath so the chain produces the right receiver.
// defensive precision: parallel detection paths (resolveObjectName -> resolveBinding
// ToGlobal) cover the polyfill emit observably here, but the walkStaticReceiverStep path
// is now uniformly correct for nested static-chain resolution
const { Math: M } = globalThis;
const { f16round } = M;
const x = f16round(1.5);
