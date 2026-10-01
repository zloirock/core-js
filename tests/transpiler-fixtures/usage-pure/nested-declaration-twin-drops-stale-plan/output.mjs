import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A loop element feeding a nested declaration: an early visit plans the declarator as it stands,
// then a sibling claim rewrites it into its flat twin in place. The plan made for the nested shape
// is dropped with it, so the static reads its own import and the twin keeps one binding per name.
for (const row of [{
  w: Array
}]) {
  const {
      w: _ref
    } = row,
    name = _nameMaybeFunction(_ref),
    from = _Array$from;
  use(name, from);
}