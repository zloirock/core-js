import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// mixed extraction + residual - the prefix runs exactly once (lift, not lift + replay)
const {
  Promise: {
    try: tryFn,
    customP
  }
} = (eff(), {
  Promise: {
    try: _Promise$try,
    customP: _Promise.customP
  }
});
export const r = [tryFn, customP];