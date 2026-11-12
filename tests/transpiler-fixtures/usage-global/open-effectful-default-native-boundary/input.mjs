// An open caller keeps its parameter pattern. A mirrored default serves the static
// while its native sibling getter still runs after the computed key.
const events = [];
export function read([{ Array: { of }, [(events.push('key'), 'sibling')]: value } = globalThis]) {
  return [of, value];
}
