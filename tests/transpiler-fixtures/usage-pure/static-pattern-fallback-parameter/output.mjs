import _Array$from from "@core-js/pure/actual/array/from";
// The fallback receiver is mirrored without replacing an explicitly supplied value.
export function read({
  w: {
    Array: {
      from
    }
  } = choose() ? {
    Array: {
      from: _Array$from
    }
  } : {}
} = {}) {
  return from([7]);
}