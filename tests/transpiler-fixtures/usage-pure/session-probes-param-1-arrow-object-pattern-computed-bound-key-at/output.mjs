import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const boundKey = 'w';
  const viaBoundKeyIife = (_ref => {
    let m = _atMaybeArray(_ref.w);
    return m;
  })({
    w: [1, 2]
  });
  use(viaBoundKeyIife);
}