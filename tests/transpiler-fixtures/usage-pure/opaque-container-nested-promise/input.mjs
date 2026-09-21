// Selection through a nested container still owes only the named Promise static in global.
const source = { values: [Promise] };
export function read(key) { return source.values[key].withResolvers(); }
