import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// `new` of a user constructor: the callee `Tag` must not be misclassified as a global
// constructor and plain identifier args stay untouched, while a polyfillable member read
// in argument position (`base.name` - Function.prototype.name is absent on ie11 functions
// and the receiver type is unknown) still folds through the Maybe instance-accessor helper
new Tag(_nameMaybeFunction(base), set, base, mods);