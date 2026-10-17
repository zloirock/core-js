import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  const boundKey = 'w';
  const viaBoundKeyIife = (({
    [boundKey]: {
      at: m
    }
  }) => m)({
    w: {
      at: _atMaybeArray([1, 2])
    }
  });
  use(viaBoundKeyIife);
}