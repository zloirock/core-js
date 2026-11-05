// Mixed literal containers retain their static property reads and native array iteration.
// Only the instance leaves dispatch through their original array or string receiver.
const numbers = { methods: Object, value: [4, 8] };
const [{ methods: { is }, value: { at } }] = [numbers, mark()];
const text = { value: 'abc', methods: Math };
const [{ value: { includes }, methods: { sign } }] = [text, mark()];
export { is, at, includes, sign };
