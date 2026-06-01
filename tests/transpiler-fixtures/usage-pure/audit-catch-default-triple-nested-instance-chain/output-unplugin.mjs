import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch-default with a THREE-level instance chain (`[9].flat().flat().at(0)`): the relocate must
// fold BOTH inner `.flat` overwrites into the outer `.at` (deeper than a two-level chain), emitting
// one disjoint composed splice rather than three overlapping ones
try {} catch (_ref) {
var _ref2, _ref3, _ref4;
let _ref5, it = (_ref5 = _getIteratorMethod(_ref)) === void 0 ? _atMaybeArray(_ref2 = _flatMaybeArray(_ref3 = _flatMaybeArray(_ref4 = [9]).call(_ref4)).call(_ref3)).call(_ref2, 0) : _ref5; it; }