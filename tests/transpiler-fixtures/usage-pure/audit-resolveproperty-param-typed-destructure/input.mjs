// Property-object-type resolution for parameter destructure with annotation on the
// ObjectPattern itself (function param). The pattern.typeAnnotation branch resolves the
// destructured `items` directly as `number[]`, then `arr.findLast` and `arr.at` should
// narrow to array-specific dispatch. Nested bindings retain their declared receiver families too.
function process({ items }: { items: number[] }) {
  items.findLast(x => x > 0);
  items.at(0);
}
process({ items: [1, 2, 3] });

export function stringSlot({ value: { at } }: { value: string }) { return at; }
export function arraySlot({ value: { includes } }: { value: number[] }) { return includes; }
