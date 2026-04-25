// `namespace Promise { ... }` (no `declare`) emits a runtime IIFE - `Promise` shadows
// the global. plugin must NOT polyfill `Promise.resolve` against the polyfilled
// constructor (would call `_Promise$resolve` instead of the user's namespace member)
namespace Promise {
  export const X = 1;
}
const p = Promise.X;
export { p };
