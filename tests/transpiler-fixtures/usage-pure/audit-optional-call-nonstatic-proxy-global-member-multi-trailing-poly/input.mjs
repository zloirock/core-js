// optional call on a non-static member of a proxy-global static (`globalThis.Map`), routed
// through the combined-chain path by TWO trailing polyfilled methods. the proxy-global static
// receiver must collapse to its pure ctor (`_Map`) - leaving `_globalThis.Map` references the
// absent native Map on engines without it and TypeErrors on the `.notAMethod` access
const r = globalThis.Map.notAMethod?.().flat().at(0);
