import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Comma-joined destructuring stays reachable in both single-statement bodies and statement lists.
// Each position owns a distinct method, so its injection is independently observable.
const src = ['p', 'q'];
let at, includes, flat, flatMap, findLast, findLastIndex;
if (cond) {} else {
  before();
  at = _atMaybeArray(src);
  after();
}
do {
  before();
  includes = _includesMaybeArray(src);
  after();
} while (cond);
for (const key in obj) {
  before();
  flat = _flatMaybeArray(src);
  after();
}
switch (value) {
  default:
    before();
    flatMap = _flatMapMaybeArray(src);
    after();
}
try {} finally {
  before();
  findLast = _findLastMaybeArray(src);
  after();
}
class C {
  static {
    before();
    findLastIndex = _findLastIndexMaybeArray(src);
    after();
  }
}