import _Array$from from "@core-js/pure/actual/array/from";
// pure twin: a real program-scope `var` aliasing a global, colliding by name with a namespace-scoped
// `var` twin. the parser attributes the over-hoisted twin as a phantom reassignment, which would
// wrongly bail the substitution; scrubbing it lets the never-reassigned alias resolve and substitute
// the receiver-less pure static import
var A = Array;
namespace N {
  var A: any;
}
_Array$from([1]);