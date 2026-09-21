import _Promise$all from "@core-js/pure/actual/promise/all";
// A nested pattern reads the imported pure constructor.
// Only pure mode supplies its missing static.
import P from "@core-js/pure/actual/promise/constructor.js";
export const {
  P: {
    all
  }
} = {
  P: {
    all: _Promise$all
  }
};