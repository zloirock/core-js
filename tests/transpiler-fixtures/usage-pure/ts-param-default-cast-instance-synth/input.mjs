// a TS cast around a parameter DEFAULT is printer trivia to the type the instance synth dispatches
// on: the default's path is read PEELED, like its node, so the array's own helper lands on both legs
// (one leg typed nothing off the wrapped path and fell to the typeless dispatch)
export function cast({ at: viaCast } = ([1, 2] as number[])) {
  return viaCast;
}
export function assertion({ at: viaAssertion } = (<number[]>[1, 2])) {
  return viaAssertion;
}
export function nonNull({ at: viaNonNull } = [1, 2]!) {
  return viaNonNull;
}
