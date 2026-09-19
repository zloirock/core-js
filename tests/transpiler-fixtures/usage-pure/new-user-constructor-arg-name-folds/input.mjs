// `new` of a user constructor: the callee `Tag` must not be misclassified as a global
// constructor and plain identifier args stay untouched, while a polyfillable member read
// in argument position (`base.name` - Function.prototype.name is absent on ie11 functions
// and the receiver type is unknown) still folds through the Maybe instance-accessor helper
new Tag(base.name, set, base, mods);
