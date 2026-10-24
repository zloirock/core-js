// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const Array = globalThis.Array;
const wrapper = { Array };
const { Array: { from } } = wrapper;
from(['x']).at(0);
