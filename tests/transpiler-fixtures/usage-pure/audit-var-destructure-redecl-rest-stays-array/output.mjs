import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a `var` redeclared via a REST destructure (var [...r] = ['s', 't']) binds the whole rest slice,
// which is always an Array - the reaching-redecl resolver must keep the array narrow for a rest slot
// (a rest has no single element slot to follow), so the array-aware at variant applies, not the generic
var r = [1];
{
  var [...r] = ['s', 't'];
}
_atMaybeArray(r).call(r, 0);