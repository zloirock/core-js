import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// ORDER independence: a polyfillable-ctor shorthand (`Set`/`Map`) visited BEFORE the nested-proxy leaf
// (`Array.from`) resolves must still ride the nested mirror's synth default - NOT a body-extract. the
// function is LOCAL + never-overridden (so the caller-lossy body-extract is otherwise permitted), and the
// leaf is transiently unresolved when the flat key is visited; the shared `nestedMirrorOwnsMixedPattern`
// gate defers BOTH emitters' body-extract / inline-default fallbacks so the synth default owns every key
function ctorFirst({
  Set,
  Map,
  Array: {
    from
  }
} = {
  Set: _Set,
  Map: _Map,
  Array: {
    from: _Array$from
  }
}) {
  return [Set, Map, from];
}
ctorFirst();