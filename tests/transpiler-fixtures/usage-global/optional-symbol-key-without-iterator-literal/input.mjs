export function read(list) {
  const { [globalThis.window?.Symbol.iterator]: method } = list;
  return method;
}
