import _Array$from from "@core-js/pure/actual/array/from";
// A var in a nested block still supplies the IIFE's receiver.
export function read() {
  {
    var Arr = Array;
  }
  return (({
    from
  } = Object) => from)({
    from: _Array$from
  });
}