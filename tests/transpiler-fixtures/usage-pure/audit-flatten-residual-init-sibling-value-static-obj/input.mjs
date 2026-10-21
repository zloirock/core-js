// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const wrapper = { ns: Array };
const { ns: { from }, x = [2].flat() } = wrapper;
from([3]);
x;
