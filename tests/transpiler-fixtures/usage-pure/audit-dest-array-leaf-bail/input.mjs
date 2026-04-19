// array destructure of non-iterable Array: plugin must not alias `bar` to the receiver
const [bar] = Array;
bar.from([1, 2, 3]);
