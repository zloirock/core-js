import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// user-authored bindings with leading-zero ref suffixes (`_ref01`, `_ref09`) sit outside
// the orphan adoption pattern - generator never emits them. plugin allocates fresh
// `_ref` / `_ref2` regardless of the user's leading-zero forms
const _ref01 = 1;
const _ref09 = 2;
const [a, b, c, d] = _Array$from(window);
const [p, q, r, s] = _Array$of(_ref01, _ref09, a, b);