import "core-js/modules/es.global-this";
// NEGATIVE: `.default` off the TS-equals binding is NOT an interop hop - the binding already
// IS the global, whose `default` slot is undefined (es.promise.race must not appear)
import XD = require("@core-js/pure/actual/global-this");
export const notInterop = () => (XD as never as {
  default: {
    Promise: PromiseConstructor;
  };
}).default.Promise.race([]);