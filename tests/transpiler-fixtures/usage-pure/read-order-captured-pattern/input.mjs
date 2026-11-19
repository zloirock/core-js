// Destructuring reads the captured value, not the later value of its source.
let r;
let cur = "ab";
const prev = cur;
cur = Map;
const { at } = prev;
r = at.call(prev, 0);
use(r);
