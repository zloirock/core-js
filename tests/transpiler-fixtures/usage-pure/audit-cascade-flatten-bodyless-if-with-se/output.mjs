import _Array$from from "@core-js/pure/actual/array/from";
// A bodyless assignment keeps its receiver effect and static binding under the same guard.
let from;
if (cond) ({
  Array: {
    from
  }
} = (logCall(), {
  Array: {
    from: _Array$from
  }
}));
console.log(from);