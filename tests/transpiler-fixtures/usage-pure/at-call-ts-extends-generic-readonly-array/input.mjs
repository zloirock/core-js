// `class ReadOnlyList extends ReadonlyArray<string>`: `ReadonlyArray` is recognised as
// an Array shape, so the receiver's inner type stays `string`. `list.at(-1)` resolves
// to the array-specific instance polyfill
class ReadOnlyList extends ReadonlyArray<string> {}
declare const list: ReadOnlyList;
list.at(-1);
