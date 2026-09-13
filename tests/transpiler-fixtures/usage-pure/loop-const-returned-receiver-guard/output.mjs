import _Array$from from "@core-js/pure/actual/array/from";
// Different calls can return different receivers for the same nested loop slot.
// Each call runs once; a guarded static keeps the custom receiver and per-iteration binding.
function first() {
  log(1);
  return Array;
}
function second() {
  log(2);
  return {
    from: custom
  };
}
for (const _ref2 of [{
  w: first()
}, {
  w: second()
}]) {
  let {
      w: _ref
    } = _ref2,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from([7]), () => from([8]));
}