// Same misread guard as the per-branch case, exercised through the parameter-destructure gate
// instead: a user default import from a `core-js`-substring path used as a computed key must not
// be mistaken for a plugin-injected pure reference, so the sibling shorthand polyfill is mirrored
// into the synth literal (`= { [K]: Array[K], of: _Array$of }`) rather than dropped
import KEY from 'a-core-js-helper';

export function pick({ [KEY]: own, of } = Array) {
  return [own, of([1])];
}
