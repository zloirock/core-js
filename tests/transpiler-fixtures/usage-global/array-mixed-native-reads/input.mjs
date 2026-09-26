// Mixed static and instance leaves retain native array and static-property reads.
// Each instance keeps its original receiver family, in either property order.
const numbers = { methods: Object, value: [4, 8] };
const [{ methods: { is }, value: { at } }] = [numbers, mark()];
const text = { value: 'abc', methods: Math };
const [{ value: { includes }, methods: { sign } }] = [text, mark()];
export { is, at, includes, sign };
