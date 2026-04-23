import _Array$from from "@core-js/pure/actual/array/from";
// 4-level proxy-global nest: `globalThis.self.window.Array.from`. all three intermediate
// keys (`self`, `window`, `self` aliases) are themselves in POSSIBLE_GLOBAL_OBJECTS, so
// the hops-ok check at every level passes and the flatten picks up `Array.from`
const from = _Array$from;
from(xs);