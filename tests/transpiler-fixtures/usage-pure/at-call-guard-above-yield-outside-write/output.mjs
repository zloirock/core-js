import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// The driver writes before the generator starts. Its guard reads that new value on the first next().
// The ordinary function runs immediately and sees the value from before the write.
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