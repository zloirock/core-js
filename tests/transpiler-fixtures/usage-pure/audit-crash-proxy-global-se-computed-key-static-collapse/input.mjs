// usage-pure proxy-global accessed via a side-effect-bearing computed key followed by a static
// dispatch that collapses the whole chain (`globalThis[(touched++, 'Array')].from`): the inner
// computed-key side effect lives in the receiver the collapse discards, so it must be collected
// and re-emitted once. without it babel drops the side effect and unplugin crashes. regression lock
let touched = 0;
const x = globalThis[(touched++, 'Array')].from([2]);
[x, touched];
