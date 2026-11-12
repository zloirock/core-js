// A dynamic sibling keeps its native key read while a relocated realm head
// still supplies the nested static in realms without the globalThis slot.
export function read(key) {
  for (const { globalThis: { [key]: value, Array: { from } } } of [globalThis]) return [value, from];
}
