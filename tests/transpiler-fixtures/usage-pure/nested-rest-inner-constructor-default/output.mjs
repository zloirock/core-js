import _Array$from from "@core-js/pure/actual/array/from";
// Rest stops pairing with the outer source but retains an inner constructor default.
const read = (...[{
  inner: {
    from
  } = {
    from: _Array$from
  }
} = {}]) => from;