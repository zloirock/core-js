import _Array$from from "@core-js/pure/actual/array/from";
// A returned argument can be a static receiver on one pass and a custom object on another.
// Calls remain in place; the guarded extraction preserves the shared var binding in closures.
// Only from is consumed: returning the second argument does not expose the Array namespace.
function receiver(label, value) {
  log(label);
  return value;
}
for (var _ref2 of [{
  w: receiver(1, Array)
}, {
  w: receiver(2, {
    from: custom
  })
}]) {
  var {
      w: _ref
    } = _ref2,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from([7]), () => from([8]));
}