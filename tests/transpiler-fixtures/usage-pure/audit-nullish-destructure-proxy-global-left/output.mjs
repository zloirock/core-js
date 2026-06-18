import _Iterator$from from "@core-js/pure/actual/iterator/from";
// Regression trap (verified non-bug): a member-access proxy-global on the LEFT of `??` / `||`
// (`globalThis.Iterator ?? Array`) is treated exactly like a bare `Iterator` reference - core-js
// PROVIDES Iterator (the pure ponyfill here), so the resolved value is always Iterator and the
// `?? Array` fallback is dead. Emitting Iterator.from is correct and consistent with bare
// `Iterator ?? Array`; flagging this as fromFallback would be a non-fix - the left still resolves
// to the always-present ponyfill, so the runtime stays Iterator.from regardless.
const from = _Iterator$from;
from([1, 2, 3]);