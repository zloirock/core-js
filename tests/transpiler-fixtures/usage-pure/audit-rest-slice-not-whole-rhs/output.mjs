import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// a POSITIONED rest (`[a, ...rest]`) binds a SLICE of the RHS - never the whole RHS
// (element 0 of the slice is not element 0 of the RHS; that narrow threw on a number
// receiver, ie:11). the slice TYPE resolves precisely: Array of the literal tail's
// common element type, so `rest[0]` is a number and injects nothing
var rest = 'abc';
{
  var [head, ...rest] = [[1], 2, 3];
}
export const viaSlice = rest[0].at(-1);

// the exact whole-RHS shape (`[...r]` at position 0) keeps the precise element narrow
var whole = 'abc';
{
  var [...whole] = [[1], 2, 3];
}
export const viaWhole = _includesMaybeArray(_ref = whole[0]).call(_ref, 1);