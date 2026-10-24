import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// a bodyless `var` whose nested instance read carries the whole init runs the init's effect prefix once:
// the dispatch spells the prefix with the receiver, so nothing lifts it a second time
export function pick(ready, log, list) {
  if (ready) var at = _at((log('at'), list));else var flat = _flatMaybeArray((log('flat'), log('again'), []));
  return [at, flat];
}