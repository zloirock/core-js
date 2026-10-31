// a function-scoped `var` declared in a NESTED block hoists to its function scope: the alias it
// holds must resolve where the var lives, not at the use site - an unrelated block there may
// shadow the hop name (the parsers disagreed here: one hoists natively, the other synthesizes
// the hoisted binding, and both must report the same declaration scope)
const seedRoot = Promise;
const seedLink = seedRoot;
export function viaNestedVarHoist() {
  { var held = seedLink; }
  {
    const seedLink = {};
    const { allSettled } = held;
    return allSettled([]);
  }
}
