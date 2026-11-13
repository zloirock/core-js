// A stable prototype default beside inert parameter work supplies both instance methods.
function read(first = 0, { at, flat } = Array.prototype, last = 0) { return [first, at, flat, last]; }
const result = read(effect(), undefined, effect());
export { result };
