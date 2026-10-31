import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// A later array element can replace the source name after its object was selected.
// Nested method reads retain the selected element and their original order.
export function read(source, replacement) {
  const [_ref] = [source, source = replacement];
  const values = _values(_ref.w);
  const at = _at(_ref.y);
  return [values, at];
}