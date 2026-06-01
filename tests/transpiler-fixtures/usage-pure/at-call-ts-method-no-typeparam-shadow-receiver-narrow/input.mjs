// a method that does NOT declare its own type parameter (`bar(): T` in `C<T>`): the receiver
// binding substitutes the return normally, so `C<string>` narrows it to string and the
// string-specific at variant is selected
interface C<T> { bar(): T; }
declare const o: C<string>;
const r = o.bar().at(0);
export { r };
