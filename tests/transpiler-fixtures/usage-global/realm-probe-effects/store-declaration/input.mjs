// The saved realm and its unbacked hop survive consuming the whole pattern.
export function read() {
  let held;
  const { resolve } = (held = globalThis.self).window.Promise;
  return typeof resolve;
}
