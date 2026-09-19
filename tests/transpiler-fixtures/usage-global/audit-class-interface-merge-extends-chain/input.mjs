// merged interface inherits from a parent generic via `extends`. classSubst -> parentSubst
// composition must thread the receiver type-arg through the parent's decl-param map so
// `Base<T>`'s methods see concrete `string` element type in `extra(): U[]` when called via
// the merged class
interface Base<U> { extra(): U[]; }
class C<T> { construct(): void {} }
interface C<T> extends Base<T> {}
declare const x: C<string>;
x.extra().at(0);
