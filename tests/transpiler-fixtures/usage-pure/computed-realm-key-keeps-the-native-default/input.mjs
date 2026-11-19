// A computed constructor key still runs when a pattern default keeps the native slot.
export function read() {
  const { [(effect(), 'Map')]: { fill, z } = {} } = globalThis;
  return [fill, z];
}
