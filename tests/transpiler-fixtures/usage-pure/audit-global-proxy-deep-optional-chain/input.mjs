// deep optional chain through proxy-globals: globalThis?.self?.Map. each link must
// pass through the global-proxy-member-name intermediate-proxy walk after ChainExpression
// is peeled by the runtime-transparent peel
const M = globalThis?.self?.Map;
const W = globalThis?.window?.Set;
M;
W;
