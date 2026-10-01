// A realm element retains each nested prototype receiver through an assignment head.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";

let at, includes;

for (const _ref of [_globalThis]) {
	const _ref2 = _ref.Array.prototype;

	at = _atMaybeArray(_ref2);
	includes = _includesMaybeArray(_ref2);
	use(at, includes);
}