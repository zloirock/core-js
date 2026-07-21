import "core-js/modules/es.function.name";
// `new` of a user constructor: the callee `Tag` must not be misclassified as a global
// constructor and the code must stay untouched (usage-global only injects imports), while
// the member read in argument position (`base.name` - Function.prototype.name is absent on
// ie11 functions, receiver type unknown, MIGHT-injection bias) still pulls the polyfill
new Tag(base.name, set, base, mods);