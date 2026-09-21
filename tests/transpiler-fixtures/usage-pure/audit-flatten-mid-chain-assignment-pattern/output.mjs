import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A default on a nested Array pattern is unreachable for the pristine realm.
// The nested method still receives its pure entry.
const {
  Array: {
    from
  } = {}
} = {
  Array: {
    from: _Array$from
  }
};
const {
  Array: {
    of
  } = {}
} = {
  Array: {
    of: _Array$of
  }
};
export { from, of };