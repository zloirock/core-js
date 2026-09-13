// Array-wrapped destructures in a for-init header retain receiver effects and stores.
// A side-effecting neighbor element is evaluated before the pattern reads its selected slot.
// Pure static bindings and instance reads must both preserve that order.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";

const seen = [];
const eff = (t) => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
let out1, out2, out3;

for (const _unused = (eff('p'), _globalThis),
	defineProperty = _Object$defineProperty; !out1; ) out1 = defineProperty;

for (const defineProperties = (kw = (eff('q'), _globalThis), _Object$defineProperties); !out2; ) out2 = defineProperties;

for (const [{ Object: { getOwnPropertyNames } }] = [
	{ Object: { getOwnPropertyNames: _Object$getOwnPropertyNames } },
	eff('s')
]; !out3; ) out3 = getOwnPropertyNames;

// A reading claim captures the stored wrapper element before dispatching, so the store
// and its effect run once in the loop header.
let out4;

for (const [_ref] = [kw = (eff('t'), _globalThis)],
	soleAt = _atMaybeArray(_ref.Array.prototype); !out4; ) out4 = soleAt;

export { out1, out2, out3, out4, seen, kw };