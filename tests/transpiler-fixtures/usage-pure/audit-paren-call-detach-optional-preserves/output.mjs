import _includes from "@core-js/pure/actual/instance/includes";
// `(arr?.includes)(1)` mixes optional lookup with non-optional call; native throws on nullish.
// Emit must preserve both: nullish path throws via `.call` on undefined, success path keeps `this=arr`.
const v = (arr == null ? void 0 : _includes(arr)).call(arr, 1);