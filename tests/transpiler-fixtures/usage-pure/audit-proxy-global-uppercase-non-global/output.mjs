import _globalThis from "@core-js/pure/actual/global-this";
// capitalised destructure from globalThis that isn't a known global — no polyfill emitted
const {
  UserClass
} = _globalThis;
UserClass?.prototype?.method?.();