import _Array$from from "@core-js/pure/actual/array/from";
// A local undefined value supplies the argument instead of selecting the default.
export function read() {
  {
    var undefined = Array;
  }
  return (({
    from
  } = Object) => from([4]))({
    from: _Array$from
  });
}