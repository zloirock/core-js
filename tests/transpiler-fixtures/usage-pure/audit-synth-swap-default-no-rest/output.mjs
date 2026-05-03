import _Array$from from "@core-js/pure/actual/array/from";
// AssignmentPattern value `{from = []} = Array` without rest / computed sibling: synth-swap
// fires (simple ObjectPattern + Identifier receiver). receiver `Array` rewritten to
// `{from: _Array$from}` literal, so `run()` / `run(undefined)` see polyfill via the synth
// object. user-passed `run({})` still triggers `from = []` runtime default - synth-swap
// path is strictly weaker than body-extract here (body-extract removes the AssignmentPattern
// entirely; synth-swap leaves the destructure pattern intact). lock for the synth-swap
// branch path that fires when no rest / computed sibling is present
function run({
  from = []
} = {
  from: _Array$from
}) {
  return from;
}
run();