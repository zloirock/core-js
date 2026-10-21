// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const array = [2, 7], rows = [Object, array];
let keys, at;
[{ keys }, { at }] = rows;
export const result = [keys({ x: 1 }), at.call(array, -1)];
