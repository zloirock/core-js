// `self` is a proxy-global on par with `globalThis` (see POSSIBLE_GLOBAL_OBJECTS), so
// the same single-chain flatten applies. confirms the receiver check isn't hardcoded to
// `globalThis` — any proxy-global in the outer init triggers the rewrite
const { Array: { from } } = self;
from([1, 2, 3]);
