import _Array$from from "@core-js/pure/actual/array/from";
var _ref;
// An unknown computed key keeps its source read native.
// Global usage loads the possible own statics; prototype methods need their own usage.
// A guarded claim at the pattern's edge may still detach ahead of it.
let M = pickConstructor();
if (!M) M = Array;
const from = (_ref = M, _ref === Array ? _Array$from : _ref.from),
  {
    [runtimeKey]: method = fallback()
  } = _ref;
export { from, method };