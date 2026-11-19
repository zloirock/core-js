import _Array$from from "@core-js/pure/actual/array/from";
// Loop-element calls keep each argument's value distinct, including a user constructor-like object.
// Only the supported call-dependent static route is served; constant wrapper reads remain native.
function pick(value) {
  return value;
}
function constant(tag) {
  return Array;
}
const custom = {
  from: fallback
};
for (const _ref2 of [{
  w: pick(Array)
}, {
  w: pick(custom)
}]) {
  const {
      w: _ref
    } = _ref2,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from([7]));
}
for (const {
  w: {
    of
  }
} of [{
  w: constant('a')
}, {
  w: constant('b')
}]) use(of(8));