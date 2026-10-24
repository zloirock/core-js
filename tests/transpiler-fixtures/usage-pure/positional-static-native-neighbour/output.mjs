// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
let sign, other;
const source = {
  get other() {
    return typeof sign;
  }
};
const rows = [Math, source];
[{
  sign
}, {
  other
}] = rows;
const inspect = {
  get next() {
    return typeof of;
  }
};
const values = [Array, inspect];
const [{
  of
}, {
  next
}] = values;
use(sign, other, of, next);