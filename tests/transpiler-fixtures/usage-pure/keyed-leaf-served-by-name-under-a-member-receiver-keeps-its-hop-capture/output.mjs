import _Array$from from "@core-js/pure/actual/array/from";
// A keyed leaf served by name under a member receiver keeps the native read and coercion
// of its hop. With no remaining reader, its capture becomes a binding-free object pattern.
const ns = {
  box: {
    w: Array,
    other: 1
  }
};
const _ref = ns.box,
  {
    w: {}
  } = _ref,
  from = (log('k'), _Array$from),
  {
    other
  } = _ref;
use(from, other);