import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
const from = _Array$from;
const { noSuch } = Array;
const y = 1;
from(noSuch);
_globalThis.__y = y;