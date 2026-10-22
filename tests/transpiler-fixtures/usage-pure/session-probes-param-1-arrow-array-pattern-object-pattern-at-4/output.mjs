import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr = [1, 2];
{
  const r = ((_ref, _unused = void 0) => {
    let [_ref2] = _ref;
    let at = _atMaybeArray(_ref2);
    return at;
  })([arr]);
}