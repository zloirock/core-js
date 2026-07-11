// aliased-with-default shape `{from: alias = []}` + computed-key sibling: the synthesized
// default supplies the pure binding under the ORIGINAL key (`from`); the pattern keeps the
// user's alias binding and inner default untouched, and the computed sibling re-reads its
// key off the raw receiver
const KEY = 'k';
function run({ from: alias = [], [KEY]: tag } = Array) {
  return [alias, tag];
}
run();
