// HKT-style alias where F is a USER alias (not a built-in container). `Wrap<F, X> = F<X>`
// splices F=Boxed at AST level inside the alias chain walker so the chain keeps descending
// into Boxed<string[]> and x.val resolves to string[]. .at(0) narrows to array
type Boxed<T> = { val: T };
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type Wrap<F, X> = F<X>;
// @ts-expect-error a generic named without its type arguments is the shape under test
declare const x: Wrap<Boxed, string[]>;
x.val.at(0);
