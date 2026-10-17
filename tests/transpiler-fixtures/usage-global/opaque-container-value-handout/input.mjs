// Passing the selected constructor to an unknown consumer exposes every static.
const source = [Promise];
export function read(key) { return consume(source[key]); }
