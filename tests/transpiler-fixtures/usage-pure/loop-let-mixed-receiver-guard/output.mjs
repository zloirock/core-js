import _Array$from from "@core-js/pure/actual/array/from";
// Heterogeneous literal elements need a guard around the nested static extraction.
// A custom property is retained and a null receiver still throws on its own iteration.
for (let _ref2 of [{
  w: Array
}, {
  w: {
    from: custom
  }
}, {
  w: null
}]) {
  let {
      w: _ref
    } = _ref2,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from([7]), () => from([8]));
}