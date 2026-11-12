import _Array$from from "@core-js/pure/actual/array/from";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A receiver default below rest still owns its nested static; supplied elements stay native.
function read(...[{
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
}]) {
  return from;
}
const [first, ...[{
  Object: {
    hasOwn
  }
} = {
  Object: {
    hasOwn: _Object$hasOwn
  }
}]] = values;