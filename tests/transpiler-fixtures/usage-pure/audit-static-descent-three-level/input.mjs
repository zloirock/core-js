// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = { a: { b: { c: Array } } };
const { a: { b: { c: { from } } } } = wrapper;
const arr = from('xyz');
arr.at(0);
arr.includes('y');
arr.copyWithin(0, 1);
