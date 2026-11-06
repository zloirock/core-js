import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The nested leaf shares one slot read with its surviving length.
// A preceding initializer runs before the slot, default and computed key.
const source = {
  get data() {
    effect('hop');
    return undefined;
  }
};
const lead = effect('lead'),
  {
    data: _ref = (effect('default'), [4, 9])
  } = source,
  method = null == _ref ? _ref[""] : (effect('key'), _atMaybeArray(_ref)),
  {
    length
  } = _ref;
use(lead, method, length);