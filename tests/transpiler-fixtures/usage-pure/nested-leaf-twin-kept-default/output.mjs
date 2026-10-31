import _at from "@core-js/pure/actual/instance/at";
// The default supplies both the kept nested binding and the method.
// The earlier initializer still runs before this one shared slot read.
function take(source, fallback) {
  var _ref;
  const lead = effect('lead');
  const _ref2 = (_ref = source.data) === void 0 ? fallback : _ref;
  const {
    other: {
      value
    }
  } = _ref2;
  const method = _at(_ref2);
  return [lead, value, method];
}