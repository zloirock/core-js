// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = { a: { b: Array } };
const { a: { b: { from } } } = wrapper;
const arr = from('xy');
arr.at(0);
arr.includes('x');
arr.copyWithin(0, 1);
