import _Array$from from "@core-js/pure/actual/array/from";
// A running initializer is read once before its extracted binding.
// A later native default observes that binding, not its TDZ.
const holder = {
  get A() {
    note('init');
    return Array;
  }
};
const _ref = holder.A,
  from = _Array$from,
  {
    make = from
  } = _ref;
use(make([7]));