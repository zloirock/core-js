import _Array$from from "@core-js/pure/actual/array/from";
// A supplied global constructor is read independently of the shadowed parameter default.
(({
  from
} = Array, Array) => from([1, 2]))({
  from: _Array$from
});