import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch destructure where an ENTRY prop carries a DEFAULT whose value is itself polyfillable
// (`it = [9].flat()`). the catch param becomes bare `_ref`, leaving no original-text needle for
// the default's polyfill to compose against, so the default must be drained and emitted in its
// baked form - emitting the raw default would drop the polyfill and orphan its scoped var.
// distinct from the computed-key sub-range case. regression lock
try {} catch (_ref) {
  var _ref3;
  let _ref2,
    it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _flatMaybeArray(_ref3 = [9]).call(_ref3) : _ref2;
  it;
}