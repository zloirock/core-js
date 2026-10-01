// A preceding native property reads before the extracted getter and its live default.
export function read(receiver, fallback) {
  const [{ other, includes = fallback() }] = [receiver];
  return [other, includes];
}
