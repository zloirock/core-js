import _Array$from from "@core-js/pure/actual/array/from";
// The supplied receiver runs outside the parameter frame. A later parameter shadows
// the default's constructor, so serving the live argument must not target that default.
(({
  from
} = Array, Array) => from([1, 2]))({
  from: _Array$from
});