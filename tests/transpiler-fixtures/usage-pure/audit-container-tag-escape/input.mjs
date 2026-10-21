// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function tagShape(strings, value) { if (value) value.k = Map; return ''; }
const tagBox = { k: Object };
void tagShape`x${ tagBox }`;
const { k: { values } } = tagBox;
const cleanBox = { k: Object };
void tagShape`plain`;
const { k: { keys } } = cleanBox;
export { values, keys };
