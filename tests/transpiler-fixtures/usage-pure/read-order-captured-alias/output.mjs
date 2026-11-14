import _Map from "@core-js/pure/actual/map/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A value captured before its source changes keeps the original instance type.
let r;
let cur = "ab";
const prev = cur;
cur = _Map;
r = _atMaybeString(prev).call(prev, 0);
use(r);