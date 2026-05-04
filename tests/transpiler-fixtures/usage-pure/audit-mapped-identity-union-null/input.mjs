// identity-rename mapped type with non-passthrough body union (`T[K] | null`).
// `expandMappedTypeMembers` should still narrow `at` / `findLast` for the array members
// because the mapped type produces members keyed identically to T's keys, and the
// instance methods called on `target.items` / `target.tags` remain Array methods.
type Source = {
  items: number[];
  tags: string[];
};
type Wrapped = { [K in keyof Source]: Source[K] | null };
declare const target: Wrapped;
target.items?.at(0);
target.tags?.findLast(t => t.length > 1);
