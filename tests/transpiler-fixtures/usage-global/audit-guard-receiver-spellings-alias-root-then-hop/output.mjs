import "core-js/modules/es.global-this";
import "core-js/modules/es.math.hypot";
import "core-js/modules/web.self";
const aliasRoot = globalThis;
let k3;
export const aliasRootThenHop = (k3 = aliasRoot.self)?.Math.hypot(3, 4);