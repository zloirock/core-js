import _Array$from from "@core-js/pure/actual/array/from";
// array destructure of non-iterable Array: plugin must not alias `bar` to the receiver
const [bar] = Array;
(bar === Array ? _Array$from : bar.from.bind(bar))([1, 2, 3]);