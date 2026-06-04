import _Array$from from "@core-js/pure/actual/array/from";
// a real program-scope `var` aliasing a global, colliding by name with a `declare global` var twin.
// the parser over-hoists the declare-global twin and attributes it as a phantom reassignment of the
// real binding; scrubbing it lets the never-reassigned alias resolve and substitute the receiver-less
// pure static import
var A = Array;
declare global {
  var A: any;
}
_Array$from([1]);