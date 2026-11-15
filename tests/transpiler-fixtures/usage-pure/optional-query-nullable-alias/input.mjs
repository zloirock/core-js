export function read() {
  const held = globalThis.window?.self;
  return held?.Array.from([3]);
}
