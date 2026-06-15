// a method that declares its own `<T>` shadows the enclosing generic alias's `T`. applying the alias's
// `T -> number[]` substitution to the method return would capture the method-local T and emit the
// array-specific helper on a foreign return (ie:11 throw). the method-local param is shadowed to unknown
// (generic); an alias method WITHOUT its own type param still binds the outer T (array-specific).
type Shadowed<T> = { pick<T>(): T };
declare const s: Shadowed<number[]>;
s.pick().at(0);
type Bound<T> = { all(): T[] };
declare const bnd: Bound<number>;
bnd.all().includes(1);
