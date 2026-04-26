// multi-declarator destructure with a sibling declarator on the same line: each
// declarator must produce its own polyfill rewrite without interfering.
const { from, noSuch } = Array, y = 1;
from(noSuch);
globalThis.__y = y;
