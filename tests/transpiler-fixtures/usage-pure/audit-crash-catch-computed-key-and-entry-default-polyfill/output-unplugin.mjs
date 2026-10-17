// A catch pattern has polyfills inside the iterator default and a later computed key.
// Both nested claims survive while key evaluation, iterator extraction, its default,
// and the later property read retain their original order.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";

try {} catch(_ref) {
	var _ref3, _ref4;

	let _ref2,
		it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _flatMaybeArray(_ref3 = [9]).call(_ref3) : _ref2;

	let { [_atMaybeArray(_ref4 = [1]).call(_ref4, 0)]: b } = _ref;

	b;
	it;
}