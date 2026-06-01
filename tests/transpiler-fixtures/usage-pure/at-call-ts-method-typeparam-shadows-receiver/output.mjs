import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a method declaring its own type parameter that shadows the receiver interface's type
// parameter (`bar<T>()` inside `C<T>`): the receiver binding must not substitute the
// method-local T, so the return stays unconstrained and the generic at variant is used
interface C<T> {
  bar<T>(): T;
}
declare const o: C<string>;
const r = _at(_ref = o.bar()).call(_ref, 0);
export { r };