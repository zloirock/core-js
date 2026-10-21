// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = { a: Array };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.at(0);
arr.includes('h');
