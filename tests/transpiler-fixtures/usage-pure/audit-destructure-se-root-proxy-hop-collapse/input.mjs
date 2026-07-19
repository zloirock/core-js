// a consumed destructure receiver that is a proxy-hop chain rooted at a LITERAL proxy global
// buried under a side-effect sequence (`(c++, globalThis).self.Map`) must COLLAPSE its redundant
// `.self` hop and harvest the effect, matching babel - not re-emit the raw receiver, which would
// leak a bare `globalThis` (a ReferenceError on the target engine) plus an undefined `.self` read
let c = 0;
const { groupBy: viaRootSe } = (c++, globalThis).self.Map;
export const a = viaRootSe;

// the effect can sit inside the hop tail too (`(c++, globalThis.self).Map`) - same collapse
const { groupBy: viaTailSe } = (c++, globalThis.self).Map;
export const b = viaTailSe;
