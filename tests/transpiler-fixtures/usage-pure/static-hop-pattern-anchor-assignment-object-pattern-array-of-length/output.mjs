import _Array$of from "@core-js/pure/actual/array/of";
let assigned;
({
  Array: {
    of: {
      length: assigned
    }
  }
} = {
  Array: {
    of: _Array$of
  }
});
export { assigned };