// `class ReadOnlyList extends ReadonlyArray<string>`: `ReadonlyArray` is recognised as
// an Array shape, so the receiver's inner type stays `string`. `list.at(-1)` resolves
// to the array-specific instance polyfill
// @ts-expect-error ReadonlyArray has no runtime value, so this class exists only for the resolver, which reads it as an array
class ReadOnlyList extends ReadonlyArray<string> {}
declare const list: ReadOnlyList;
// @ts-expect-error ReadonlyArray has no runtime value, so this class exists only for the resolver, which reads it as an array
list.at(-1);
