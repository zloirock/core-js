import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
{
  // Read the nested method once before evaluating the following computed key and reading its property.
  function key() {
    return 'k';
  }
  const _ref = {
    m: [1],
    k: 2
  };
  const at = _atMaybeArray(_ref.m),
    {
      [key()]: picked
    } = _ref;
}