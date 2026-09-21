import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// Only the constructor level reads the index; outer rest keeps its realm source.
const _ref = _globalThis,
  {
    any,
    ...inner
  } = _Promise,
  {
    Promise: _unused,
    ...outer
  } = _ref;
export { any, inner, outer };