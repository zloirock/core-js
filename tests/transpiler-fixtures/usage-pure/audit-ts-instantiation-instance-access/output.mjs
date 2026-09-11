import _at from "@core-js/pure/actual/instance/at";
// TS instantiation expression `f<T>` followed by an instance-method access: the
// type-arg block is stripped and the access is rewritten.
const fn = _at(arr)<number>;