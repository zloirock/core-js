// shorthand-with-default `{from = []}` + computed-key sibling forces synth-swap bail.
// body-extract removes the prop entirely (no rest sibling) and prepends body decl.
// pre-fix this case fell through to inline-default `{from = _polyfill}` which let user-
// passed `{from: customFn}` override the polyfill. now matches babel-plugin's polyfill-
// always-wins contract
const TAG = 't';
function run({ from = [], [TAG]: tag } = Array) {
  return [from, tag];
}
run();
