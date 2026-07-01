// NonNullable<null | undefined | T[]>: nullable members appear BEFORE T[] in the union.
// The NonNullable unwrap resolves the annotation in context and folds the union, which
// drops null/undefined/never via SKIP. probe whether the leading-nullable shape still
// resolves the Array inner correctly (vs trailing-nullable form).
type Cleaned = NonNullable<null | undefined | number[]>;
declare const arr: Cleaned;
const head = arr.at(0);
const tail = arr.findLast(x => x > 0);
export { head, tail };
