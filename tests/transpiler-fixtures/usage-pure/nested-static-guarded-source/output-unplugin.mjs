// Fully consumed nested static slots keep the optional source check.
// A missing window throws before the computed key; a present source evaluates it once.
// The leading receiver effect stays ahead of the check and both extracted bindings.
import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";

const events = [];
let result;

try {
	const _ref2 = (
		_pushMaybeArray(events).call(events, 'source'),
		null == _globalThis.window ? void 0 : _self
	);

	const { Array: _ref } = _ref2;
	const _ref3 = _ref;

	const from = null == _ref3
		? _ref3[""]
		: (_pushMaybeArray(events).call(events, 'key'), _Array$from);

	const keys = ((null == _ref2 ? void 0 : _ref2).Object, _Object$keys);

	result = [from([7])[0], keys({ x: 1 })[0]];
} catch(error) {
	result = _nameMaybeFunction(error);
}

export { events, result };