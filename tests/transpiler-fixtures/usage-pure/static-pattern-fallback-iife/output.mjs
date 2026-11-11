import _Array$from from "@core-js/pure/actual/array/from";
// An immediately invoked pattern reads the same mirrored fallback as a parameter.
export const result = (({
  w: {
    Array: {
      from
    }
  } = choose() ? {
    Array: {
      from: _Array$from
    }
  } : {}
}) => from([7]))({});