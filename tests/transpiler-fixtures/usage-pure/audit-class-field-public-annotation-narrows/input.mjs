// explicit type annotation on a public field bypasses the "externally writable -> unknown"
// fallback. the annotation is authoritative: caller opted into the contract, so narrowing
// `.at(-1)` to `_atMaybeArray` is sound
class C {
  items: number[] = [];
  first() { return this.items.at(-1); }
}
