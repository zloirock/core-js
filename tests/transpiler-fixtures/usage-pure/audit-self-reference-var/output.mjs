import _Map from "@core-js/pure/actual/map/constructor";
// `var Map = Map` - hoisted var binding self-initialises. identifier-visitor detects
// `binding.kind === 'var'` + `init.name === name`, routes through `resolveBindingToGlobal`
// (returns 'Map' via self-ref branch) and emits the Map polyfill. The name-matching
// transform rewrites both the init and subsequent references to `_Map`
var Map = _Map;
const m = new _Map();
m.get('k');