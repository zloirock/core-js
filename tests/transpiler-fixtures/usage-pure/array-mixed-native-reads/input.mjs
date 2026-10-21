// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const numbers = { methods: Object, value: [4, 8] };
const [{ methods: { is }, value: { at } }] = [numbers, mark()];
const text = { value: 'abc', methods: Math };
const [{ value: { includes }, methods: { sign } }] = [text, mark()];
export { is, at, includes, sign };
