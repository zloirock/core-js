// destructure with a conditional fallback init: the polyfill rewrite still threads
// through both branches consistently.
const cond = Math.random() > 0.5;
const { from } = cond ? Array : Set;
from([1, 2, 3]);
