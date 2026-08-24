// proxy/static flatten (`{ from } = (SE, Array)`) whose lifted SE-prefix IIFE body hosts BOTH an
// instance-method polyfill AND a nested destructure-with-default. the nested declaration must
// emit before its container so the container drains its scoped ref - the reverse
// order once produced overlapping rewrites. regression lock
const o = [1];
const { from } = ((() => { [1].at(0); const { at = () => 0 } = o; return Array; })(), Array);
from([1]);
