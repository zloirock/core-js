// Multiple computed-key extractions retain their declaration order and TDZs.
// Each stable source is checked before its key effect; a plain following initializer stays last.
const { [(e1(), 'at')]: a } = arr, { [(e2(), 'flat')]: f } = arr2;
const { [(e3(), 'includes')]: i } = arr3, plain = 5;
console.log(a, f, i, plain);
