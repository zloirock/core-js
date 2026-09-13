import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
const {
  Array: {
    from
  } = {},
  ...rest
} = _globalThis;
from('hi');
rest.Object;