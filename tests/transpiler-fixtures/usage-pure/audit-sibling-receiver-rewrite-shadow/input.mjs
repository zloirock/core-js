// polyfillSiblingReceiverRefs rewrites every Identifier matching the flattened-receiver
// name without scope check. function param shadowing globalThis must NOT be rewritten -
// it's a local binding, not the global. needs multi-declarator const where the
// destructure decl extracts the receiver and the sibling decl shadows it
const { Array: { from } } = globalThis, y = (function (globalThis) { return globalThis; })(1);
export { from, y };
