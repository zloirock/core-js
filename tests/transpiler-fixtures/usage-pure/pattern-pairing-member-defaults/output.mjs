import _Array$from from "@core-js/pure/actual/array/from";
// Each default and source slot can write the same member target.
({
  self: {
    Array: {
      from: sink.method
    }
  }
} = {
  self: {
    Array: {
      from: _Array$from
    }
  }
});
sink.method([3]);