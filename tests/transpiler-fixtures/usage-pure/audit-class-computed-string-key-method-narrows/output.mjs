import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key class member with literal-string key (`class C { ['method']() {...} }`)
// has the same identity as the bare `method` form - babel/oxc both expose the literal
// key via `keyMatchesName`'s `literalKeyValue` extractor. before the fix, findClassMember
// dropped EVERY computed-key member (`if (member.node.computed) continue;`) regardless of
// whether the key resolved statically; after the fix the gate moves to `keyMatchesName`,
// so dynamic-only computed keys still bail while static-string forms reach the type-flow
class Box {
  ['fetchItems'](): number[] {
    return [1, 2, 3];
  }
}
declare const b: Box;
const arr = b.fetchItems();
const head = _atMaybeArray(arr).call(arr, 0);
export { head };