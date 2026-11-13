// A later inert default does not prevent instance extraction.
export function read({ includes }, options = { xs: [1, -2, null] }) {
  return [includes, options];
}
