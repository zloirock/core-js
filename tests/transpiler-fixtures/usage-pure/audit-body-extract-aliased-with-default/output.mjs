import _Array$from from "@core-js/pure/actual/array/from";
// aliased-with-default shape `{from: alias = []}` + computed-key sibling forces synth-swap
// to bail (computed sibling). body-extract path now fires unconditionally regardless of
// AssignmentPattern wrapper - prop binding-identifier resolver peels AssignmentPattern.left to surface
// the alias. body emit is `let alias = _polyfill;` (preserves the user's chosen local name)
const KEY = 'k';
function run({
  from: alias = [],
  [KEY]: tag
} = {
  from: _Array$from,
  [KEY]: Array[KEY]
}) {
  return [alias, tag];
}
run();