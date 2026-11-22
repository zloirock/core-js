// Writing an existing element establishes String as the tag's receiver. An index absent from
// the literal can be inherited, so the destructured binding still needs an identity check in pure.
const list = [1];
list[0] = String;
export const viaMember = list[0].raw`x`;
const pair = [];
pair[0] = Object;
const { 0: O } = pair;
export const viaKeyed = O.groupBy([1], x => x);
