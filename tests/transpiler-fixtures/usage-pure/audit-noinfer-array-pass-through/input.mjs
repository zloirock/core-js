// NoInfer<T> is a transparent wrapper around T. Confirm the inner type passes
// through to receiver-type narrowing without losing precision.
type Wrap<T> = NoInfer<T[]>;
declare const arr: Wrap<string>;
arr.includes('x');
arr.at(0);
