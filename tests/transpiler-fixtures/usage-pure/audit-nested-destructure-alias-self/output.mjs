import _Array$from from "@core-js/pure/actual/array/from";
// `self` is a proxy-global on par with `globalThis` (see POSSIBLE_GLOBAL_OBJECTS), so
// the same single-chain flatten applies. confirms the receiver check isn't hardcoded to
// `globalThis` — any proxy-global in the outer init triggers the rewrite
const from = _Array$from;
from([1, 2, 3]);