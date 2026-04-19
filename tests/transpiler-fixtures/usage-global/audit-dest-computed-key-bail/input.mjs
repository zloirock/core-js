// computed-key destructure: plugin must not alias `bar` to the receiver
const k = 'foo';
const { [k]: bar } = Array;
bar.from([1, 2, 3]);
