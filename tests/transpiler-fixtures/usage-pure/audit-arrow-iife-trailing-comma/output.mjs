import _Array$from from "@core-js/pure/actual/array/from";
// an arrow IIFE whose call argument carries a trailing comma still substitutes its receiver: the
// comma is formatting and leaves no trace in the rebuilt argument
(({
  from
}) => from(1))({
  from: _Array$from
});