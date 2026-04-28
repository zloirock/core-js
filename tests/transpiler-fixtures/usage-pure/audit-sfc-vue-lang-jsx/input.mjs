// JSX-only SFC: `lang=jsx` (no TS) covers the `j`+`sx` branch of the lang-suffix lift.
// without lift oxc would treat `Component.vue` as plain JS and reject `<div>` tokens
// silently. with `.jsx` synthesized hint the JSX parser fires and the polyfill emit
// inside JSX expression containers reaches the `arr.flat?.()` member-call
const el = <div>{arr.flat?.()}</div>;
arr.at(0);
