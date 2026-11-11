// An immediately invoked pattern reads the same mirrored fallback as a parameter.
export const result = (({ w: { Array: { from } } = choose() ? globalThis : {} }) => from([7]))({});
