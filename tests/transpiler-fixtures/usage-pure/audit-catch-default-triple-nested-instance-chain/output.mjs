import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch-default with a THREE-level instance chain (`[9].flat().flat().at(0)`): the relocate must
// fold BOTH inner `.flat` overwrites into the outer `.at` (deeper than a two-level chain), emitting
// one disjoint composed splice rather than three overlapping ones
try {} catch (_ref) {
  var _ref3, _ref4, _ref5;
  let _ref2,
    it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _atMaybeArray(_ref3 = _flatMaybeArray(_ref4 = _flatMaybeArray(_ref5 = [9]).call(_ref5)).call(_ref4)).call(_ref3, 0) : _ref2;
  it;
}