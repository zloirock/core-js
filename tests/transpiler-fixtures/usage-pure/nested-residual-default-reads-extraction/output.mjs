import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A native sibling default follows the nested static it reads.
// The realm getter runs once before either binding.
const holder = {
  get realm() {
    note('init');
    return _globalThis;
  }
};
const _ref = holder.realm,
  {
    Array: {}
  } = _ref,
  from = _Array$from,
  {
    make = from
  } = _ref;
use(make([7]));