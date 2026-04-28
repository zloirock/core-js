import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// JSX-only SFC: `lang=jsx` (no TS) covers the `j`+`sx` branch of the lang-suffix lift.
// without lift oxc would treat `Component.vue` as plain JS and reject `<div>` tokens
// silently. with `.jsx` synthesized hint the JSX parser fires and the polyfill emit
// inside JSX expression containers reaches the `arr.flat?.()` member-call
const el = <div>{_flatMaybeArray(arr)?.call(arr)}</div>;
_at(arr).call(arr, 0);