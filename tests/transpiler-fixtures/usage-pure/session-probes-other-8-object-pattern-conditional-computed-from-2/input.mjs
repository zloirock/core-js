// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
let pick = 1;
const userObj = {};
const k = 'k';
{
const { w: { from: f } } = { w: pick ? Array : userObj, [k]: 1 };
}
