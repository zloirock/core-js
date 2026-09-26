import _at from "@core-js/pure/actual/instance/at";
// The array getter and default stay between the surrounding initializers.
export function read(receiver, before, fallback, after) {
  var _ref2;
  const head = before(),
    [_ref] = [receiver],
    /* First read. */at = (_ref2 = _at(_ref)) === void 0 ? fallback() : _ref2,
    {
      other
    } = _ref,
    tail = after();
  return [head, at, other, tail];
}