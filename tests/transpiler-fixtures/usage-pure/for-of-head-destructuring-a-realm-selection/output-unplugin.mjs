// A nested instance read dispatches on the actual iterated receiver.
// Unplugin also mirrors the realm arm's static; Babel retains the native `of` read.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";

for (const _ref2 of [
	c
		? {
			Array: {
				prototype: { at: _atMaybeArray(_globalThis.Array.prototype) },
				of: _Array$of
			}
		}
		: fb
]) {
	const { Array: _ref } = _ref2;
	const at = _at(_ref.prototype), { of } = _ref;

	use(at, of);
}