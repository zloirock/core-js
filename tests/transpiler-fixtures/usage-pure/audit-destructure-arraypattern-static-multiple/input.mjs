// two statics in one multi-element ArrayPattern (`[{ from }, { of }]`): each extracts to its own
// `const from = _Array$from` / `const of = _Array$of` and both consumed keys rename to `_unused`,
// proving the partial-extraction fires per-element without dropping the shared declarator
const [{ from }, { of }] = [Array, Array];
from([1]);
of(2, 3);
