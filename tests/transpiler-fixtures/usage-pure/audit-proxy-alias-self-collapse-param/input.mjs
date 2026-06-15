// Same root as the const case, exercised through the function-parameter-default receiver: a
// const-aliased global (`const g = globalThis`) with a redundant `.self` hop must collapse to
// `g.Array` (alias kept, hop dropped) so the residual `...rest` does not read `g.self` (undefined
// on ie:11 / non-browser hosts). (parameter-default / synth-swap path)
const g = globalThis;
function withDefault({ from, ...rest } = g.self.Array) {
  return from([1]);
}
withDefault();
