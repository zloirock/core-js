import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
// Writing another key does not suppress a static polyfill.
for (const c of [Array, _Map]) c.extra = 1;
export const result = _Array$from([1]);