import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// deep optional chain through proxy-globals: globalThis?.self?.Map. each link must
// pass through globalProxyMemberName's intermediate-proxy walk after unwrapRuntimeExpr peels
// ChainExpression
const M = _Map;
const W = _Set;
M;
W;