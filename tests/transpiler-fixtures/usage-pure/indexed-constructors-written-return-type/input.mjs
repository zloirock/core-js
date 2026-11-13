// An indexed constructor selection keeps its patch and the patched return type.
for (var i = 0, items = [Array, Map]; i < items.length; i++) {
  const c = items[i];
  c.from = () => "ab";
}
export const result = Array.from([]).at(-1);
