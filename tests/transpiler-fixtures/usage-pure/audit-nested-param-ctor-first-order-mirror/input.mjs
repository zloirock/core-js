// ORDER independence: a polyfillable-ctor shorthand (`Set`/`Map`) visited BEFORE the nested-proxy leaf
// (`Array.from`) resolves must still ride the nested mirror's synth default - NOT a body-extract. the
// function is LOCAL + never-overridden (so the caller-lossy body-extract is otherwise permitted), and the
// leaf is transiently unresolved when the flat key is visited; the shared `nestedMirrorOwnsMixedPattern`
// gate defers BOTH emitters' body-extract / inline-default fallbacks so the synth default owns every key
function ctorFirst({ Set, Map, Array: { from } } = globalThis) {
  return [Set, Map, from];
}
ctorFirst();
