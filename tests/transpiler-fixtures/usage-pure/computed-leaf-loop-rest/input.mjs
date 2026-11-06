// Instance slots beside object rest keep their native reads.
// Keys and defaults retain their independent polyfills and evaluation order.
const leaf = [5, 6];
for (const { data: { [(key(), 'at')]: method = fallback(), ...rest } } of [{ get data() { log(); return leaf; } }]) {
  use(method.call(leaf, -1), rest);
}
