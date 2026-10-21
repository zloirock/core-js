// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const src = { Object, Array };
const o = {};
({ Array: { from: o.f, of: o.g } } = src);
let values;
({ Object: { entries: o.e, values } } = src);
export { o, values };
