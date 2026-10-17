import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
export const mirrorable = (({
  Promise,
  Array: {
    at
  }
} = {
  Promise: _Promise,
  Array: _globalThis.Array
}) => [Promise, at])();