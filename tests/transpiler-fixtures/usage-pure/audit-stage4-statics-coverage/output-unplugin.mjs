import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _RegExp$escape from "@core-js/pure/actual/regexp/escape";
// usage-pure coverage for stage 4 statics that DO polyfill in pure mode:
// `RegExp.escape`, `Promise.withResolvers`, `Object.groupBy`. each call site is on a
// distinct static so the emitted imports show which entry each line triggered.
// note: iterator helpers and typed-array statics are intentionally NOT polyfilled in pure
// (see TASKS.md design decisions); they belong to the usage-global surface only
const escaped = _RegExp$escape('a.b');
const { resolve } = _Promise$withResolvers();
const grouped = _Object$groupBy([1, 2, 3], (x) => x % 2);