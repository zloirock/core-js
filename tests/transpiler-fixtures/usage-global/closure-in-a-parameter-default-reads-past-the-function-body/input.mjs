// a closure written in a parameter list runs in that list's environment, which the body's declarations
// never join - its `var`s included, which get an environment of their own once the list holds an
// expression - so the closure reads past them to the outer binding or the global
const s = 'abc';
export function last(p = () => s.at(-1)) { const s = [1, 2]; return [p, s]; }
export function settled(r = () => Promise.resolve(7)) { let Promise = 1; return [r, Promise]; }
export function lifted(q = () => Iterator.from(xs)) { var Iterator = 1; return [q, Iterator]; }
