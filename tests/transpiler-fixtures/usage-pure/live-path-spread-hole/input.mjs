// A hole inside a written spread still yields undefined.
// Later constructor rewrites preserve the spread's native iteration.
const [, { from }, ...rest] = [...[, Array], Map, Set];
export { from, rest };
