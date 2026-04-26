import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// multi-declarator destructure with a sibling declarator on the same line: each
// declarator must produce its own polyfill rewrite without interfering.
const from = _Array$from,
  {
    noSuch
  } = Array,
  y = 1;
from(noSuch);
_globalThis.__y = y;