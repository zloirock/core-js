import _Array$from from "@core-js/pure/actual/array/from";
// nested proxy-global destructure with inner default `= []`. naive rewrite puts the polyfill
// into the default slot: `{ Array: { from = _Array$from } } = _globalThis` - runtime default
// fires only when the property is undefined, so on engines with buggy-but-present native the
// polyfill is imported but never assigned. the flatten binds the polyfill directly and keeps the
// user's default as the static guard the flat twin prints (dead text: the pure is always defined)
const from = _Array$from === void 0 ? [] : _Array$from;
from([1, 2, 3]);