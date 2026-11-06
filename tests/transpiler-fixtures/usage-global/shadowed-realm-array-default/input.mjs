// A local object's same-named slot can leave an array element undefined.
export function read(globalThis) {
  const [{ includes } = [13]] = [globalThis.window];
  return includes;
}
