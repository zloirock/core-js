// An effectful constructor element retains its call beside an opaque prototype default.
// The instance leaf keeps generic dispatch while the static retains its substitution.
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";

export function read(unknown) {
	const log = [];

	function make() {
		_pushMaybeArray(log).call(log, 'make');

		return Array;
	}

	for (const _ref of [make()]) {
		var _ref2;
		const _ref3 = _ref;
		const from = _Array$fromAsync;
		const _ref4 = (_ref2 = _ref3.prototype) === void 0 ? unknown : _ref2;
		const at = _at(_ref4);
		const { length } = _ref4;

		use(from, at, length);
	}

	return log;
}