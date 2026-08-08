// capitalised destructure from globalThis: `UserClass` is not a known global, so no
// per-name polyfill resolves for it. `globalThis` receiver itself is still polyfilled
const { UserClass } = globalThis;
UserClass?.prototype?.method?.();
