// multi-hop and wrapper variations on optional-member predicate callees. resolution must walk
// nested OptionalMemberExpression / MemberExpression and peel ChainExpression / TS wrappers.
// distinct methods pin each narrow: isStr branch -> .repeat -> es.string.repeat; isArr branch
// -> .at -> es.array.at; isStr-ts-cast -> .padStart -> es.string.pad-start.
interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
interface Container {
  kit: Predicates;
}
function caller(state: Container, input: string | number[]) {
  // optional at second hop: state.kit?.isStr - tests walk through OptionalMemberExpression at root
  if (state.kit?.isStr(input)) {
    input.repeat(2);
  }
  // optional at first hop: state?.kit.isStr - tests walk through OptionalMemberExpression at inner node
  if (state?.kit.isArr(input)) {
    input.at(-1);
  }
  // TS cast + optional - TSAsExpression peeled before shape match
  if ((state as Container).kit?.isStr(input)) {
    input.padStart(4, '0');
  }
}
caller(undefined as any, undefined as any);
