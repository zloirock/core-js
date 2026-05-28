// both HKT paths in one file: Wrap<Array, ...> via the Type-object lane (built-in F),
// Wrap<Boxed, ...> via the AST splice lane (user-alias F). distinct methods
// (.at vs .findLast) prove each line routes through its own lane independently
type Boxed<T> = { val: T };
type Wrap<F, X> = F<X>;
declare const a: Wrap<Array, string>;
declare const b: Wrap<Boxed, string[]>;
a.at(0);
b.val.findLast(s => s.length > 0);
