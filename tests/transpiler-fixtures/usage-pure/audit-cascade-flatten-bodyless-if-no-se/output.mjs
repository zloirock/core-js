import _Array$from from "@core-js/pure/actual/array/from";
// A bodyless conditional retains its nested static assignment in the conditional body.
let from;
if (cond) ({
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
});
console.log(from);