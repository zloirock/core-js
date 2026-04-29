// JSX-only SFC: `lang=jsx` (no TS) covers the JSX branch of the SFC lang-suffix lift.
// Without the lift, the parser would see `Component.vue` as plain JS and reject `<div>`
// tokens silently. With the `.jsx` synthetic extension hint, the JSX parser fires and
// the polyfill emit inside JSX expression containers reaches the `arr.flat?.()` call
const el = <div>{arr.flat?.()}</div>;
arr.at(0);
