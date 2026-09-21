import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A head element built by a CALL answers for every pass only where the arguments answer alike: a
// callee can hand its own argument back, so a constructor beside a user object parts the passes and
// the leaf keeps its runtime guard. Primitive arguments carry no claim of their own, so a callee
// reached under them reads the same value each pass and its leaf extracts once.
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
  let {
      w: _ref
    } = _ref2,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from([7]));
}
for (const _ref3 of [{
  w: constant('a')
}, {
  w: constant('b')
}]) {
  let of = _Array$of;
  use(of(8));
}