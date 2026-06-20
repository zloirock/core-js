// nested proxy-global forwarder chain (`globalThis.self` - self forwards to the global namespace too)
// ending in a static, optional call on a non-static member, multi-trailing. the WHOLE forwarder chain
// must collapse to the static's pure ctor (`globalThis.self.Map` -> `_Map`) - collapsing only the inner
// forwarder (`_self.Map`) strands `.Map` on the absent native Map on engines without it
const r = globalThis.self.Map.notAMethod?.().flat().at(0);
