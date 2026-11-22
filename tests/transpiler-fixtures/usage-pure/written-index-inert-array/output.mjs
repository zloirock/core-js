import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _String$raw from "@core-js/pure/actual/string/raw";
// Writing an existing element establishes String as the tag's receiver. An index absent from
// the literal can be inherited, so the destructured binding still needs an identity check in pure.
const list = [1];
list[0] = String;
export const viaMember = _String$raw`x`;
const pair = [];
pair[0] = Object;
const {
  0: O
} = pair;
export const viaKeyed = (O === Object ? _Object$groupBy : O.groupBy.bind(O))([1], x => x);