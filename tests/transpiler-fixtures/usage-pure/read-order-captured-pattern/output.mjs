import _Map from "@core-js/pure/actual/map";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Destructuring reads the captured value, not the later value of its source.
let r;
let cur = "ab";
const prev = cur;
cur = _Map;
const at = _atMaybeString(prev);
r = at.call(prev, 0);
use(r);