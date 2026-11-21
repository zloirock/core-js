function opaque() { return { Array: { of() { return 'custom'; } } }; }
export function spelled(flag) {
  return (flag ? globalThis : opaque()).Array.of(1);
}
