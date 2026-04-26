// TS instantiation expression `f<T>` followed by an instance-method access: the
// type-arg block is stripped and the access is rewritten.
const fn = arr.at<number>;
