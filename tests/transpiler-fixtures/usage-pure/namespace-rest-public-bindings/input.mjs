// A namespace cannot hide a rest exclusion sentinel with a module export list.
// Keep the original bindings and exclusions native, including constructor bindings.
namespace N {
  export const { Map: M, Array: { from }, ...rest } = globalThis;
}
export { N };
