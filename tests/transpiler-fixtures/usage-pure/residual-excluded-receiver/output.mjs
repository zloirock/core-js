import _globalThis from "@core-js/pure/actual/global-this";
// Excluding the realm leaf keeps its native property read behind the window guard.
// The prefix runs once; a nullish receiver throws before the nested default.
const {
  missing = fallback()
} = (record(), (null == _globalThis.window ? void 0 : _globalThis.self).Map);
use(missing);