import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// The import path does not prove its value is a safe mirror key.
// The declaration retains that key and guards the named static on its selected receiver.
import KEY from 'a-core-js-helper';
export function pick(cond) {
  const _ref = cond ? Array : _Set,
    {
      [KEY]: own
    } = _ref,
    from = _ref === Array ? _Array$from : _ref.from;
  return [own, from];
}