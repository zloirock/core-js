// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const userGlobal = { Array };
for (const { Array: { from } } = ((() => [].values())(), userGlobal); false;) from([]).at(0);
