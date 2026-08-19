import _Array$from from "@core-js/pure/actual/array/from";
// computed-key destructure: plugin must not alias `bar` to the receiver
const k = 'foo';
const {
  [k]: bar
} = Array;
(bar === Array ? _Array$from : bar.from.bind(bar))([1, 2, 3]);