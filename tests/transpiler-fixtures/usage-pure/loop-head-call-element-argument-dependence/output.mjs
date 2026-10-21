import _Array$from from "@core-js/pure/actual/array/from";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
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