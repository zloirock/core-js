// `for (const [k, v] of map)` destructures Map iteration into key (string) and value (number);
// `.at(...)` on `k` and `.toFixed(...)` on `v` route to type-specific polyfills.
declare const m: Map<string, number>;
for (const [k, v] of m) {
  k.at(0);
  v.toFixed(2);
}
