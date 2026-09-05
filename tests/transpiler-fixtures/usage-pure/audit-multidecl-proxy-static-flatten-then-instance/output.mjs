import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// One multi-declarator statement pairs a proxy-global static destructure (`{ from } = globalThis.Array`,
// flattened to a direct binding) with a sibling declarator whose init is a polyfilled instance call.
// the sibling is relocated past the flattened binding during the rewrite, so its instance substitution -
// emitted as a sourcemap-split pair - is composed and drained as one logical unit, not as two halves.
const arr = [3, 1, 2];
const from = _Array$from;
const picked = _atMaybeArray(arr).call(arr, 0);
from([4, 5]);
picked;