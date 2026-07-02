// usage-pure proxy-global reached through a const alias, accessed via a side-effect-bearing
// computed key, then a different collapsing static (`g[(touched++, 'Array')].of`): the inner
// computed-key side effect must be collected and re-emitted once, not dropped. regression lock
let touched = 0;
const g = globalThis;
const x = g[(touched++, 'Array')].of(1, 2);
[x, touched];
