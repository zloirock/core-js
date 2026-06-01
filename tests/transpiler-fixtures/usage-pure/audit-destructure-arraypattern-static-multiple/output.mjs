import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
const from = _Array$from;
const of = _Array$of;
// two statics in one multi-element ArrayPattern (`[{ from }, { of }]`): each extracts to its own
// `const from = _Array$from` / `const of = _Array$of` and both consumed keys rename to `_unused`,
// proving the partial-extraction fires per-element without dropping the shared declarator
const [{
  from: _unused
}, {
  of: _unused2
}] = [Array, Array];
from([1]);
of(2, 3);