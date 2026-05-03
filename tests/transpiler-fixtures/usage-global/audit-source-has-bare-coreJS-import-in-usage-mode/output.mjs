import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
// `usage-global` mode but source contains a top-level umbrella entry import.
// `entry-global` mode would expand it; `usage-global` does not run entry visitors.
// `scanExistingCoreJSImports` only matches `core-js/modules/*` and `@core-js/pure/*`,
// so the bare `core-js` import is left untouched (passes through to bundler).
import 'core-js';
const arr = [1, 2];
const v = arr.at(-1);
const w = arr.findLast(x => x > 0);
export { v, w };