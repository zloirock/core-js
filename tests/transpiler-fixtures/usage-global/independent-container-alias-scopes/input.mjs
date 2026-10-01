// The escaping box belongs to read. The unrelated hidden binding only reads a static method,
// so pure keeps Map's constructor entry while the returned Set carries its whole family.
function hidden() {
  const box = { value: Map };
  return box.value.groupBy([1], x => x);
}
export function read() {
  const box = { value: Set };
  return box.value;
}
