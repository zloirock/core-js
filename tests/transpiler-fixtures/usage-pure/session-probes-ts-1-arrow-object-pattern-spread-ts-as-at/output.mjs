import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  // @ts-expect-error a spread argument tsc cannot place is the shape under test
  const r = (_ref => {
    let at = _atMaybeArray(_ref);
    return at;
  })(...([[1, 2]] as any));
}