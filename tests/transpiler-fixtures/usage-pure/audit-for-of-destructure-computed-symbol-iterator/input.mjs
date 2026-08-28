// a computed `Symbol.iterator` key in a loop head: the iterated elements are opaque, so the
// element types nothing and the claim is the method LOOKUP off whatever each round binds. the head
// has no declaration to extract into, so the relocation gives it one and the lookup lands there;
// the optional call on the resolved binding stays as the source wrote it
for (const { [Symbol.iterator]: it } of [obj1, obj2]) {
  it?.();
}
