import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order.
export function collect(observe) {
  for (const [,] = [(observe(() => of), _globalThis)], {} = _globalThis, of = (_globalThis.Array, _Array$of), {
      Array: _unused,
      ...rest
    } = _globalThis;;) {
    return [of(3), rest];
  }
}