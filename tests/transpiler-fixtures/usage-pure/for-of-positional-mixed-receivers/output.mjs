import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Each positional leaf has its own type, even when an earlier leaf causes head relocation.
// Array at and string includes must not inherit one another's receiver type.
const rows = [[1], '02'];
for (const _ref3 of [rows]) {
  const [_ref, _ref2] = _ref3;
  const at = _atMaybeArray(_ref);
  const includes = _includesMaybeString(_ref2);
  use(at, includes);
}