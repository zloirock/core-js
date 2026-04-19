// array destructure of non-iterable Array: plugin must not alias `bar` to the receiver.
// iterator-family imports are syntax-level (array-pattern requires iterable), independent
// of the guard being tested here
const [bar] = Array;
bar.from([1, 2, 3]);
