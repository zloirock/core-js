// A stored environment probe retains the read of an excluded realm hop.
// Prefix, key and capture effects stay in place before the final write.
let held;
(held = globalThis.window).self.slot = rhs();
(before(), held = globalThis.window).self.slot = rhs();
(held = globalThis.window)[(key(), 'self')].slot = rhs();
(holder[['value'].at(0)] = globalThis.window).self.slot = Array.from(values);
export { held };
