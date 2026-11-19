import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Falsy left operands remain the selected receivers of closed callers and parameter defaults.
// Instance helpers must read those values even when the right operand has another family.
const empty = '';
function read({
  at
}) {
  return at;
}
export const caller = read(empty && [1]);
export const fallback = function ({
  includes
} = '' && [2]) {
  return includes;
}();