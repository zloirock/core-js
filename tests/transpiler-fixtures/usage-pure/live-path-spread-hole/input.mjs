// An unbound hole stays a hole while expanding a literal spread.
// Later constructor rewrites use their actual slots after that expansion.
const [, { from }, ...rest] = [...[, Array], Map, Set];
export { from, rest };
