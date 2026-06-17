// A generic type-alias body whose method declares its own type parameter (`bar<T>()` inside
// `type C<T>`): collecting the alias members folds the receiver's `C<string>` argument into each
// signature, but the method-local T must be shadowed first so it is not captured by that substitution.
// The return therefore stays unconstrained and the generic at variant is used, instead of narrowing to
// a string at.
type C<T> = {
  bar<T>(): T;
};
declare const o: C<string>;
const r = o.bar().at(0);
export { r };
