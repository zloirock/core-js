import _Array$from from "@core-js/pure/actual/array/from";
import _repeatMaybeString from "@core-js/pure/actual/string/instance/repeat";
var _ref;
// `include: ['es.array.from|es.string.repeat']` - user alternation pattern. without
// `(?:...)` non-capturing group around the user input, regex parsed as `(^es.array.from)|
// (es.string.repeat$)` and matched starts-with / ends-with substrings (over-broad).
// post-fix: matches whole `es.array.from` OR whole `es.string.repeat` ONLY - both whole
// entries trigger emission, validator accepts the user pattern as describing real entries
export const a = _Array$from([1, 2, 3]);
export const s = _repeatMaybeString(_ref = 'hi').call(_ref, 3);