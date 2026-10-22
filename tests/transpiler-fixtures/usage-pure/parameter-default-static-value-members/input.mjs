// A selected realm supplies a static value's instance members before a later parameter reads them.
// A supplied receiver keeps its own members and bypasses the selected default.
export function read({ Object: { keys: { name }, entries } } = flag ? globalThis : own, after = name) {
  return [name, entries, after];
}
