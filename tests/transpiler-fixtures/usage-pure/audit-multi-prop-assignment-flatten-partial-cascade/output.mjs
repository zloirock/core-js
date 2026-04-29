import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// destructure assignment with one polyfill-eligible and one opaque outer prop. the
// polyfill extracts; the opaque prop stays in the residual destructure (with a polyfilled
// receiver); the host statement survives because the residual still has a consumer
let from, x;
({
  custom: {
    x
  }
} = _globalThis);
from = _Array$from;