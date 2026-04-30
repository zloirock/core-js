// deep optional chain through proxy-globals: globalThis?.self?.Map. each link must
// pass through globalProxyMemberName's intermediate-proxy walk after unwrapRuntimeExpr peels
// ChainExpression
const M = globalThis?.self?.Map;
const W = globalThis?.window?.Set;
M;
W;
