import _at from "@core-js/pure/actual/instance/at";
// The default supplies both the kept nested binding and the method.
// The earlier initializer still runs before this one shared slot read.
function take(source, fallback) {
  const lead = effect('lead'),
    {
      data: _ref = fallback
    } = source,
    {
      other: {
        value
      }
    } = _ref,
    method = _at(_ref);
  return [lead, value, method];
}