import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a direct read before the aliasing write keeps the RUNTIME ctor guard: the pre-write
// read falls to the raw member and throws natively, the post-write path gets the polyfill
let M4;
export const f = (M4 === _Map ? _Map$groupBy : M4.groupBy.bind(M4))(items, keyFn);
M4 = _Map;