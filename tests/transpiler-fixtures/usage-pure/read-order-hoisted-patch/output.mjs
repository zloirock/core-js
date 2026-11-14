import _Map from "@core-js/pure/actual/map";
// A constructor installed by a hoisted function must carry the subsequent patch.
let r;
let M = null;
init();
M.groupBy = Function("return 17");
r = _Map.groupBy([]);
function init() {
  M = _Map;
}
use(r);