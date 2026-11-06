// Relocating a loop head preserves a native static beside an instance claim.
let from, at;
for ({ C: { from }, values: { at } } of [{ C: Array, values: [1] }]) {
  use(from, at);
}
