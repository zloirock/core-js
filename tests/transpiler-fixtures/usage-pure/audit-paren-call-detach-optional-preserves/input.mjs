// `(arr?.includes)(1)` mixes optional lookup with non-optional call; native throws on nullish.
// Emit must preserve both: nullish path throws via `.call` on undefined, success path keeps `this=arr`.
const v = (arr?.includes)(1);
