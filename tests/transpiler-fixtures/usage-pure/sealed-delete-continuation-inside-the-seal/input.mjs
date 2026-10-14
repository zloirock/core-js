// A `delete` through a seal over a probe navigation keeps its guard on the probe, and the `?.` re-hung past the
// guard opens a chain that runs to the top of the continuation inside the seal - through member, call and
// non-null links alike: a short-circuit ends at the seal, where the source's own `?.` ended.
export const viaMember = delete (globalThis.window?.self.box.k).n;
export const viaCall = delete (globalThis.window?.self.box.f()).n;
export const viaNonNull = delete (globalThis.window?.self.box!.k).n;
