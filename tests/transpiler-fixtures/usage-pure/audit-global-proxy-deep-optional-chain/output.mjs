import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// deep optional chain through proxy-globals: globalThis?.self?.Map. each link must
// pass through the global-proxy-member-name intermediate-proxy walk after ChainExpression
// is peeled by the runtime-transparent peel
const M = _Map;
const W = _Set;
M;
W;