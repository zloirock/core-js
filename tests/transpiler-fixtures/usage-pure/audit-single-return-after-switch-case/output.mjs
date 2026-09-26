import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// Switch cases can return Map or Set before the Array tail. The retained-body proof leaves
// the switch intact, and every return guards the read as a candidate: the Array a fallthrough
// reaches serves its static, while Map and Set need constructor bindings only.
const out = (_ref = (() => {
  switch (kind) {
    case 'a':
      return _Map;
    case 'b':
      return _Set;
  }
  return Array;
})(), _ref === Array ? _Array$from([1]) : _ref.from([1]));
export { out };