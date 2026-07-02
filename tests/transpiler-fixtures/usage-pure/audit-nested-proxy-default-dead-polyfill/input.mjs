// nested proxy-global destructure with inner default `= []`. naive rewrite puts the polyfill
// into the default slot: `{ Array: { from = _Array$from } } = _globalThis` - runtime default
// fires only when the property is undefined, so on engines with buggy-but-present native the
// polyfill is imported but never assigned. flatten drops user's default and binds directly
const { Array: { from = [] } } = globalThis;
from([1, 2, 3]);
