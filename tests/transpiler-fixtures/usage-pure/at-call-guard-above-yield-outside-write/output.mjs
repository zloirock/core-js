import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a generator body runs no further than its next `yield`, so a write its driver makes there reaches
// the read below that parking point and both families inject. a body that parks nowhere runs whole
// at its call, ahead of the same write, and keeps its narrow
export function belowYield(v, extra) {
  let x = v;
  function* read() {
    if (typeof x === 'string') {
      yield 0;
      return _at(x).call(x, 0);
    }
    return null;
  }
  const steps = read();
  x = extra;
  return steps;
}
export function atomicBody(v, extra) {
  let y = v;
  function read() {
    if (typeof y === 'string') return _includesMaybeString(y).call(y, 'a');
    return null;
  }
  const done = read();
  y = extra;
  return done;
}