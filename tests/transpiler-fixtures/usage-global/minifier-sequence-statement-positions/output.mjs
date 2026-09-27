import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
// Comma-joined destructuring stays reachable in both single-statement bodies and statement lists.
// Each position owns a distinct method, so its injection is independently observable.
const src = ['p', 'q'];
let at, includes, flat, flatMap, findLast, findLastIndex;
if (cond) {} else {
  before();
  ({
    at
  } = src);
  after();
}
do {
  before();
  ({
    includes
  } = src);
  after();
} while (cond);
for (const key in obj) {
  before();
  ({
    flat
  } = src);
  after();
}
switch (value) {
  default:
    before();
    ({
      flatMap
    } = src);
    after();
}
try {} finally {
  before();
  ({
    findLast
  } = src);
  after();
}
class C {
  static {
    before();
    ({
      findLastIndex
    } = src);
    after();
  }
}