// user-authored bindings with leading-zero ref suffixes (`_ref01`, `_ref09`) sit outside
// the orphan adoption pattern - generator never emits them. plugin allocates fresh
// `_ref` / `_ref2` regardless of the user's leading-zero forms
const _ref01 = 1;
const _ref09 = 2;
const [a, b, c, d] = Array.from(window);
const [p, q, r, s] = Array.of(_ref01, _ref09, a, b);
