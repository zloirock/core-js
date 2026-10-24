import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  function mark() {}
  const viaSeqArg = ((_ref, _unused = void 0) => {
    let m = _atMaybeArray(_ref);
    return m;
  })((mark(), [1, 2]));
  use(viaSeqArg);
}