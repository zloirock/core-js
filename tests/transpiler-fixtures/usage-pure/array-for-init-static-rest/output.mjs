import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// The initializer observes the static binding before initialization; rest excludes its hop.
export function collect(observe) {
  for (const [_ref] = [(observe(() => of), _globalThis)], _ref2 = _ref, _ref3 = _ref2["Array"], of = _Array$of, {
      Array: _unused,
      ...rest
    } = _ref2;;) {
    return [of(3), rest];
  }
}