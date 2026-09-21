import _Array$from from "@core-js/pure/actual/array/from";
// The loop captures its element without changing the stored container.
const source = [Array];
let result;
for (const _ref2 of [source]) {
  let [_ref] = _ref2,
    _ref3 = _ref,
    from = null == _ref3 ? _ref3[""] : _Array$from,
    {
      from: _unused,
      ...rest
    } = _ref3;
  result = from([1]);
}
export { result };