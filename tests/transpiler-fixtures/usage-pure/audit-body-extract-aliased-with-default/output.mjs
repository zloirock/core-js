import _Array$from from "@core-js/pure/actual/array/from";
// aliased-with-default shape `{from: alias = []}` + computed-key sibling: the synthesized
// default supplies the pure binding under the ORIGINAL key (`from`); the pattern keeps the
// user's alias binding and inner default untouched, and the computed sibling re-reads its
// key off the raw receiver
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