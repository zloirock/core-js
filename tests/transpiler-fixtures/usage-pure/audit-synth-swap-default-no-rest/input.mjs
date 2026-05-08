// `{from = []} = Array` without rest or computed siblings: synth-swap can rewrite the
// receiver `Array` to a `{from: _Array$from}` literal so the destructure pattern stays
// intact while still threading the polyfill through `run()` / `run(undefined)`
function run({ from = [] } = Array) {
  return from;
}
run();
