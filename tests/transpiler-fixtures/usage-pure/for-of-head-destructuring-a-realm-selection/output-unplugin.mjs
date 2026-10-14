// A for-of head destructuring a realm selection out of an array literal: unplugin mirrors the realm arm with
// its static and instance leaves served (the sidecar), while babel keeps the whole head native - its debt,
// which leaves both leaves unpolyfilled.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

for (const { Array: { prototype: { at }, of } } of [
	c
		? {
			Array: {
				prototype: { at: _atMaybeArray(_globalThis.Array.prototype) },
				of: _Array$of
			}
		}
		: fb
]) use(at, of);