// A pre-polyfilled static extraction and its residual rest pattern stay unchanged on a second pass.
// Keep the serving import beside its sentinel: together they identify the earlier claim.
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$try from "@core-js/pure/actual/promise/try";
const attempt = _Promise$try;
const {
  Promise: {
    try: _unused3,
    prototype: {
      then
    },
    ...tried
  }
} = _globalThis;
export { attempt, then, tried };