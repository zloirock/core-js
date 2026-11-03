import _globalThis from "@core-js/pure/actual/global-this";
// A prefix does not make an effectful realm key eligible for pure collapse.
export const {
  Array: {
    from
  }
} = (prefix(), _globalThis)[key(), 'window'];