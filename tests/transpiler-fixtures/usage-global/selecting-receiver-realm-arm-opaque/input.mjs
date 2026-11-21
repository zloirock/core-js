function opaque() { return { Array: { of() { return 'custom'; } } }; }
// No arm names a realm: nothing to test against, the read stays native.
export function opaqueOnly(flag) {
  return (flag ? opaque() : { Array }).Array.of(1);
}
