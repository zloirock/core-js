import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A paired computed getter supplies the prefix of an inner setter-only default.
// The getter runs once, and only the array default supplies includes.
const key = "wrap";
for (const _ref2 of [{
  get [key]() {
    return {
      set data(value) {}
    };
  },
  set wrap(value) {}
}]) {
  var _ref;
  const includes = _includesMaybeArray((_ref = _ref2.wrap.data) === void 0 ? [8, 9] : _ref);
  use(includes.call([8, 9], 9));
}