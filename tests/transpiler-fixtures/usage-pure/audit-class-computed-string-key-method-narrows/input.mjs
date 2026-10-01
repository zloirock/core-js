// computed-key class member with a literal-string key (`class C { ['method']() {...} }`) has
// the same identity as the bare `method` form. before the fix EVERY computed-key member was
// dropped regardless of whether its key resolved statically; now the gate keys on the resolved
// literal value, so dynamic-only computed keys still bail while static-string forms reach type-flow
class Box {
  ['fetchItems'](): number[] {
    return [1, 2, 3];
  }
}

declare const b: Box;
const arr = b.fetchItems();
const head = arr.at(0);
export { head };
