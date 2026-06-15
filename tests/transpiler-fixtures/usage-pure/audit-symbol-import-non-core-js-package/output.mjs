// `import _it from "my-lib/symbol/iterator"` - user library happens to use the same
// `*/symbol/X` path shape as core-js polyfill imports. Symbol.iterator detection from
// non-core-js packages must not match the polyfill source check, otherwise `_it` would
// be misclassified as Symbol.iterator and routed through the polyfill lookup. The source
// filter only accepts imports from known core-js packages or namespaces
import _it from "my-lib/symbol/iterator";
const arr = [];
export const has = arr[_it];