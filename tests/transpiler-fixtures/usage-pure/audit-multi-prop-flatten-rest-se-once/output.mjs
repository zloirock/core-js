import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
const {} = (sideEffect(), _globalThis),
  {
    Array: {},
    ...rest
  } = _globalThis,
  from = _Array$from;