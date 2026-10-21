// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const dynamicKey = 'a';
const wrapper = { [dynamicKey]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
