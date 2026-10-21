import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref;
// Folded static and instance keys preserve buried effects when their claims replace the member.
// An effectful realm-hop key retains the native member and its independent key claims.
let log = [];
function k(name) {
  _pushMaybeArray(log).call(log, name);
}
const staticConcat = (k('a'), _Array$from)([1, 2]);
const instanceConcat = (_ref = [3, 4], k('b'), _atMaybeArray(_ref).call(_ref, 0));
const staticTemplate = (k('c'), _Object$entries)({
  x: 1
});
const hopConcat = _globalThis[(k('d'), 'se') + 'lf'].Array.of(5);
export { staticConcat, instanceConcat, staticTemplate, hopConcat, log };