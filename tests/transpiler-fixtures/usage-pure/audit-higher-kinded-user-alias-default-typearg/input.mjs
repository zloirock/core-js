// HKT splice when usage omits X - default `string[]` on the alias param fills in,
// the chain still produces Boxed<string[]> and .at(0) narrows to array
type Boxed<T> = { val: T };
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Wrap<F, X = string[]> = F<X>;
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const x: Wrap<Boxed>;
x.val.at(0);
