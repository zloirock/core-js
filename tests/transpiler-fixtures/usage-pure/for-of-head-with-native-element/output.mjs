import _Array$of from "@core-js/pure/actual/array/of";
// A native element beside a realm element keeps its own static read.
for (const {
  Array: {
    of
  }
} of [{
  Array: {
    of: _Array$of
  }
}, {
  Array: {
    of: null
  }
}]) of(1);