import _globalThis from "@core-js/pure/actual/global-this";
// A rest-bearing namespace export keeps its native property reads and public names.
// A leaf asking about the host must not authorize private extraction bindings.
namespace Library {
  export const {
    Array: {
      from
    },
    ...rest
  } = _globalThis;
}
export { Library };