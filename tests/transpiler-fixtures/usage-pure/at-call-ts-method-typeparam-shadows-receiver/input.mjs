// a method declaring its own type parameter that shadows the receiver interface's type
// parameter (`bar<T>()` inside `C<T>`): the receiver binding must not substitute the
// method-local T, so the return stays unconstrained and the generic at variant is used
interface C<T> { bar<T>(): T; }
declare const o: C<string>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
const r = o.bar().at(0);
export { r };
