import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// every preceding case TEST is evaluated before the matching case body runs, whatever ended the
// preceding body: a reassignment inside such a test reaches the `string` case, so its narrow drops
// and both families inject. a write in a preceding case BODY that cannot fall through never runs
// for this case and keeps the narrow
export function f(v) {
  let x = v;
  switch (typeof x) {
    case (x = [1, 2], 'number'):
      break;
    case 'string':
      return _at(x).call(x, 0);
  }
  return null;
}
export function g(v, other) {
  let x = v;
  switch (typeof x) {
    case 'number':
      x = other;
      return null;
    case 'string':
      return _includesMaybeString(x).call(x, 'a');
  }
  return null;
}