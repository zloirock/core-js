import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// rest-pattern variant of multi-prop SE-prefix lift. extracted polyfilled prop must lift
// the SE prefix exactly once; the surviving rest-pattern receives the bare proxy in its
// init slot - duplicating the SE inside the remainder pattern would re-evaluate the side
// effect on the destructure rebuild
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
sideEffect();
const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;