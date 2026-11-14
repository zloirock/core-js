// A value captured before its source changes keeps the original instance type.
let r;
let cur = "ab";
const prev = cur;
cur = Map;
r = prev.at(0);
use(r);
