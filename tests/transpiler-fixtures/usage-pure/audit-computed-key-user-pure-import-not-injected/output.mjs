import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
// A user pure import used as a key is not a proven property key.
// Keep its read native and guard the named static on the selected constructor.
import _Array$from from '@core-js/pure/actual/array/from';
export function pick(cond) {
  const _ref = cond ? Array : _Set,
    {
      [_Array$from]: own
    } = _ref,
    of = _ref === Array ? _Array$of : _ref.of;
  return [own, of([1])];
}