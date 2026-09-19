// SE-tail proxy-global static receiver (`(inc(), globalThis).Map`), routed through the combined-chain
// path by two trailing polyfilled methods. the proxy-global static must collapse to its pure ctor
// while the leading effect stays ahead in eval order: `(inc(), _Map)`. leaving `(inc(), _globalThis).Map`
// references the absent native Map on engines without it and TypeErrors on the `.notAMethod` access
let calls = 0;
const inc = () => { calls += 1; return 0; };
const r = (inc(), globalThis).Map.notAMethod?.().flat().at(0);
