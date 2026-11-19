// The pattern owns its anchor when its source is a for-of binding.
export const r = [];
for (const realm of [globalThis]) {
  const { globalThis: { Array: { prototype: { at, includes } } } } = realm;
  r.push(typeof at, typeof includes);
}
