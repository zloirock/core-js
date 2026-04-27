// ReturnType<Fn<string>> on a generic function alias - alias-chain accumulates
// {T: string} which must apply to the return body so x narrows to string.
// without subst propagation, T inside the return body stays unbound and .at
// on the resolved type drops to generic instance dispatch
type StringFn<T> = () => T;
type ArrayFn<T> = () => T[];
declare const ch: ReturnType<StringFn<string>>;
ch.at(0);
declare const arr: ReturnType<ArrayFn<string>>;
arr.findLast(it => it != null);
