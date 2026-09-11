// a `let` inside a `declare module` block is scoped to that module body, so the bare outside
// `Promise.allSettled(...)` is the real global. the over-hoist guard drops the over-hoisted
// module-scoped binding for the outside use so the Promise static polyfill is injected
declare module "m" {
  export let Promise: number;
}
Promise.allSettled([]);
