import _Array$from from "@core-js/pure/actual/array/from";
// The element was captured before the alias changed and outside the parameter shadow.
let A = Array;
const source = [A];
A = {
  from: () => 9
};
function read(A) {
  const [_ref] = source,
    _ref2 = _ref,
    from = _Array$from,
    {
      from: _unused,
      ...rest
    } = _ref2;
  return from([1]);
}
export const result = read(A);