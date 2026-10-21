import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function tagShape(strings, value) {
  if (value) value.k = _Map;
  return '';
}
const tagBox = {
  k: Object
};
void tagShape`x${tagBox}`;
const values = _values(tagBox.k);
const cleanBox = {
  k: Object
};
void tagShape`plain`;
const {
  k: {
    keys
  }
} = cleanBox;
export { values, keys };