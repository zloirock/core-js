// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const { Array: { from } } = globalThis;
const wrapper = { a: Object };
const { a: { entries } } = wrapper;
const arr = from('hi');
const pairs = entries({ k: 1 });
arr.includes('h');
pairs.at(0);
