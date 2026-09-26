// Bare `import 'core-js'` umbrella in usage-global mode: detected API usage still emits
// individual polyfill imports, and the original bare import is left untouched in source.
import 'core-js';
const arr = [1, 2];
const v = arr.at(-1);
const w = arr.findLast(x => x > 0);
export { v, w };
