import _Array$from from "@core-js/pure/actual/array/from";
// aliased-with-default shape `{from: alias = []}` + computed-key sibling forces synth-swap
// to bail (computed sibling). body-extract path now fires unconditionally regardless of
// AssignmentPattern wrapper - propBindingIdentifier peels AssignmentPattern.left to surface
// the alias. body emit is `let alias = _polyfill;` (preserves the user's chosen local name)
const KEY = 'k';
function run({
  [KEY]: tag
} = Array) {
  let alias = _Array$from;
  return [alias, tag];
}
run();