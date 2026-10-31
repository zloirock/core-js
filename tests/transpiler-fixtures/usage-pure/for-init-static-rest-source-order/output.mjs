import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// The initializer runs before the extracted binding, including its temporal dead zone.
for (const from = (observe(() => from), _Array$from), {
    Array: _unused,
    ...rest
  } = _globalThis; keepGoing();) {
  use(from([1]), rest);
}