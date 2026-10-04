import _at from "@core-js/pure/actual/instance/at";
// The array getter and default stay between the surrounding initializers.
export function read(receiver, before, fallback, after) {
  var _ref;
  const head = before(),
    [,] = [receiver],
    /* First read. */at = (_ref = _at(receiver)) === void 0 ? fallback() : _ref,
    {
      other
    } = receiver,
    tail = after();
  return [head, at, other, tail];
}