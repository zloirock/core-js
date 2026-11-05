import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-init capture keeps the callback before of is initialized and excludes Array from rest.
// The served static leaf comes from array/of without moving the rest read.
export function collect(observe) {
  for (const [,] = [(observe(() => of), _globalThis)], {} = _globalThis, of = (_globalThis.Array, _Array$of), {
      Array: _unused,
      ...rest
    } = _globalThis;;) {
    return [of(3), rest];
  }
}