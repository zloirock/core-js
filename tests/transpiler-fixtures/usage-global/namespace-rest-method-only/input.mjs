// A rest-bearing namespace export keeps its native property reads and public names.
// A leaf asking about the host must not authorize private extraction bindings.
namespace Library {
  export const { Array: { from }, ...rest } = globalThis;
}
export { Library };
