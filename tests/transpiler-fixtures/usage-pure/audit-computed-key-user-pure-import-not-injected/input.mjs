// A user pure import used as a key is not a proven property key.
// Keep its read native and guard the named static on the selected constructor.
import _Array$from from '@core-js/pure/actual/array/from';

export function pick(cond) {
  const { [_Array$from]: own, of } = cond ? Array : Set;
  return [own, of([1])];
}
