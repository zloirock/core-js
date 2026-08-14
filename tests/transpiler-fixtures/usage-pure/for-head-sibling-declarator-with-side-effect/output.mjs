import _Array$from from "@core-js/pure/actual/array/from";
import _JSON$parse from "@core-js/pure/actual/json/parse";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Set from "@core-js/pure/actual/set/constructor";
// a for-HEAD holding a consumed declarator beside one whose init has a side effect: only the
// declarators the extraction introduces are registered on the scope. re-registering the whole
// declaration re-registers the sibling an earlier prop already rewrote, and the build aborts
let calls = 0;
function bump() {
  calls++;
  return JSON;
}
for (const from = _Array$from, _ref = bump(), parse = _JSON$parse; flag;) break;
for (const {
    of
  } = _Set, _ref2 = bump(), stringify = _JSON$stringify, z = 1; flag;) break;
console.log(calls, from, parse, of, stringify, z);