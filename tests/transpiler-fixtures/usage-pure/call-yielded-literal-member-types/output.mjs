import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
var _ref, _ref2;
// a member of the literal a CALL yields is typed off that literal, as the inline literal's is: the
// member spelling, a binding of the call, the destructure spelling, a slot the callee fills from a
// parameter, a for-of head over the call, a block body of plain statements. each row calls a method
// an array shares with a string, an iterator or a DOM collection, so a narrow injects the array
// entry alone - and nothing for `forEach`, which every array already has
const build = () => ({
  arr: [1, 2]
});
export const viaMember = _atMaybeArray(_ref = build().arr).call(_ref, 0);
const held = build();
export const viaBinding = _includesMaybeArray(_ref2 = held.arr).call(_ref2, 1);
const {
  arr: viaPattern
} = build();
export const viaDestructure = _keysMaybeArray(viaPattern).call(viaPattern);
const wrap = value => ({
  arr: value
});
const {
  arr: viaParam
} = wrap([3]);
export const viaArgument = _valuesMaybeArray(viaParam).call(viaParam);
for (const {
  arr: viaHead
} of [build()]) use(_entriesMaybeArray(viaHead).call(viaHead));
function block() {
  const marker = 1;
  use(marker);
  return {
    arr: [marker]
  };
}
export const viaBlock = block().arr.forEach(use);