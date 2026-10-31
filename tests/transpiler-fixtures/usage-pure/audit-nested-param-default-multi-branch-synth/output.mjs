import _Array$from from "@core-js/pure/actual/array/from";
import _Object$assign from "@core-js/pure/actual/object/assign";
// SIBLING BRANCHES both mirror into the synthesized default - every branch is carried (a
// one-branch literal would TypeError the other on the no-argument call). distinct constructors
// and methods show each branch resolved independently
function f({
  Array: {
    from
  },
  Object: {
    assign
  }
} = {
  Array: {
    from: _Array$from
  },
  Object: {
    assign: _Object$assign
  }
}) {
  return [from, assign];
}
f();