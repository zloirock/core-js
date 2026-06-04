import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// usage-pure proxy-global reached through a const alias, accessed via a side-effect-bearing
// computed key, then a different collapsing static (`g[(touched++, 'Array')].of`): the inner
// computed-key side effect must be collected and re-emitted once, not dropped. regression lock
let touched = 0;
const g = _globalThis;
const x = (touched++, _Array$of)(1, 2);
[x, touched];