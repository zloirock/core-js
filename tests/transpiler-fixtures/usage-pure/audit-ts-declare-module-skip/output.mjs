import _Map from "@core-js/pure/actual/map/constructor";
// `declare module` / `declare const` / `declare function` — type-only hoistings, never runtime.
// Map inside a declare block must not trigger polyfill, even if the `Map` identifier appears.
declare module "polyfilled" {
  export const m: Map<string, number>;
}
declare const fakeMap: Map<string, number>;
declare function makePromise(): Promise<void>;
// But real runtime usage still polyfills.
new _Map();