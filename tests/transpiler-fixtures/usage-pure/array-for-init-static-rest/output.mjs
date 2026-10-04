import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The initializer observes the static binding before initialization; rest excludes its hop.
export function collect(observe) {
  for (const [,] = [(observe(() => of), _globalThis)], of = (_globalThis.Array, _Array$of), {
      Array: _unused,
      ...rest
    } = _globalThis;;) {
    return [of(3), rest];
  }
}