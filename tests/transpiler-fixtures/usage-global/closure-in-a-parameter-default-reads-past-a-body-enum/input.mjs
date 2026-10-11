// a closure written in a parameter list runs in that list's environment, so an enum the function's body
// declares does not shadow a name it reads: the closure reads the global or the outer binding
export function grouped(p = () => Map.groupBy(xs, f)) { enum Map { x } return [p, Map]; }
const s = 'abc';
export function last(q = () => s.at(-1)) { enum s { y } return [q, s]; }
