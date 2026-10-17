// A stable prototype default beside quiet parameter work reads both instance methods eagerly.
function read(first = 0, { at, flat } = Array.prototype, last = 0) { return [first, at, flat, last]; }
const result = read(effect(), undefined, effect());
export { result };
