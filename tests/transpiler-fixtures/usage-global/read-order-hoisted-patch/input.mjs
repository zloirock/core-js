// A constructor installed by a hoisted function must carry the subsequent patch.
let r;
let M = null;
init();
M.groupBy = Function("return 17");
r = Map.groupBy([]);
function init() {
  M = Map;
}
use(r);
