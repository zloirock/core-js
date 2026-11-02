import _globalThis from "@core-js/pure/actual/global-this";
// The receiver default writes the key before the retained nested pattern reads it.
// Supplying an argument skips that initializer; no parameter read moves into the body.
let key = 'Promise';
export function read({
  globalThis: {
    [key]: {
      prototype
    }
  }
} = (key = 'Array', {
  globalThis: _globalThis
})) {
  return Array.isArray(prototype);
}
read();