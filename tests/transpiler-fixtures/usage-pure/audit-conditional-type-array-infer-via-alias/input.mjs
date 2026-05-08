// element-of-array infer pattern reached through an alias chain: `Item<T> = T extends
// (infer U)[] ? U : never; type Inner = Item<string[][]>`. findTypeMember must thread
// through the conditional's infer pattern so the receiver narrows to `string[]`. `.at()`
// shows the narrowing distinctly - array-narrowed `_atMaybeArray` vs the generic `_at`
// that would be picked when the inner type stays unresolved
type Item<T> = T extends (infer U)[] ? U : never;
type Inner = Item<string[][]>;
declare const inner: Inner;
inner.at(0);
inner.includes('a');
