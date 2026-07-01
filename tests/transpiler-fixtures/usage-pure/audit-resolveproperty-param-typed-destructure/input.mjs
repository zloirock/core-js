// Property-object-type resolution for parameter destructure with annotation on the
// ObjectPattern itself (function param). The pattern.typeAnnotation branch resolves the
// destructured `items` directly as `number[]`, then `arr.findLast` and `arr.at` should
// narrow to array-specific dispatch. Distinct methods so each emit traces to its line
function process({ items }: { items: number[] }) {
  items.findLast(x => x > 0);
  items.at(0);
}
process({ items: [1, 2, 3] });
