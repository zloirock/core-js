import _Array$from from "@core-js/pure/actual/array/from";
import _repeatMaybeString from "@core-js/pure/actual/string/instance/repeat";
var _ref;
// `include: ['es.array.from|es.string.repeat']` - user alternation pattern. Pattern
// compilation wraps the user input in a non-capturing group so the start / end anchors
// apply to the whole alternation, matching whole `es.array.from` OR whole `es.string.repeat`.
// Without grouping the anchors would attach to one branch each, matching substrings
export const a = _Array$from([1, 2, 3]);
export const s = _repeatMaybeString(_ref = 'hi').call(_ref, 3);