import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

// Read the constructor once after the prefix, then bind its method and native sibling.
// The assignment must also call mk once before reading the numeric property.
const { Array: _ref } = (eff(), _globalThis);

const a2 = _atMaybeArray(_ref.prototype),
	{ foo: b2 } = _ref;

let f3, z3;

function mk() {
	return _globalThis;
}

({ 0: z3 } = mk().Array);
f3 = _Array$of;

export { a2, b2 };