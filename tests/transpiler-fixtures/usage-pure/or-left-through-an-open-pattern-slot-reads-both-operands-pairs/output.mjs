import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref;
let pair = {
  C: _WeakSet
};
if (flag) pair = {
  C: null
};
const {
  C: Q
} = pair;
export const pairs = (_ref = Q || Object, _ref === Object ? _Object$entries : _entries(_ref));