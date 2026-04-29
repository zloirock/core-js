import _Array$from from "@core-js/pure/actual/array/from";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// `'from' in (Array ?? Object)` cannot fold to a single static receiver,
// so the `in` check stays raw and only the `Array.from` / `Object.fromEntries`
// usages in the following statements get polyfilled independently.
const a = 'from' in (Array ?? Object);
const b = _Array$from(src);
const c = _Object$fromEntries(pairs);
export { a, b, c };