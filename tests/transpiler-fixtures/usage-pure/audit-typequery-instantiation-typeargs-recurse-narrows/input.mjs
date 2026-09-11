// Outer generic `T` threads into a TS 4.7 instantiation expression `typeof makeBox<T>` inside `ReturnType`.
// Substitution must recurse into the inner typeParameters so `items` resolves to `number[]`, not raw `T`.
declare function makeBox<U>(): { items: U };
interface Container<T> {
  box: ReturnType<typeof makeBox<T>>;
}
declare const c: Container<number[]>;
const head = c.box.items.at(0);
const idx = c.box.items.findLastIndex(x => x > 0);
export { head, idx };
