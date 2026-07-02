import _globalThis from "@core-js/pure/actual/global-this";
// capitalised destructure from globalThis: `UserClass` is not a known global, so no
// per-name polyfill resolves for it. `globalThis` receiver itself is still polyfilled
const {
  UserClass
} = _globalThis;
UserClass?.prototype?.method?.();