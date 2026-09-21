import _Array$from from "@core-js/pure/actual/array/from";
// A pure IIFE in an array wrapper supplies the mirrored static receiver.
const [{
  from
}] = [(() => ({
  from: _Array$from
}))()];