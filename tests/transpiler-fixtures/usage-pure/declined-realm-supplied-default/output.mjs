import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// An explicitly supplied empty slot executes the user's default.
// Filling the receiver default cannot replace caller values or claim that leaf default.
let key = 'Promise';
export function read({
  globalThis: {
    [key]: {
      prototype = _atMaybeString('abc').call('abc', -1)
    }
  }
} = (key = 'Array', {
  globalThis: _globalThis
})) {
  return prototype;
}
read({
  globalThis: {
    Promise: {}
  }
});