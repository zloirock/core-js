// a member of the literal a CALL yields is typed off that literal, as the inline literal's is: the
// member spelling, a binding of the call, the destructure spelling, a slot the callee fills from a
// parameter, a for-of head over the call, a block body of plain statements. each row calls a method
// an array shares with a string, an iterator or a DOM collection, so a narrow injects the array
// entry alone - and nothing for `forEach`, which every array already has
const build = () => ({ arr: [1, 2] });
export const viaMember = build().arr.at(0);
const held = build();
export const viaBinding = held.arr.includes(1);
const { arr: viaPattern } = build();
export const viaDestructure = viaPattern.keys();
const wrap = value => ({ arr: value });
const { arr: viaParam } = wrap([3]);
export const viaArgument = viaParam.values();
for (const { arr: viaHead } of [build()]) use(viaHead.entries());
function block() {
  const marker = 1;
  use(marker);
  return { arr: [marker] };
}
export const viaBlock = block().arr.forEach(use);
