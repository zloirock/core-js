import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
// Multi-hop and wrapper variations on optional-member predicate callees. complements the
// single-hop fixture: tests walk through nested OptionalMemberExpression / MemberExpression
// nodes plus entry peel of ChainExpression / TS expression wrappers. distinct methods per
// branch (.repeat / .at / .padStart) pin emission to the narrow:
//   isStr branch  -> string  -> es.string.repeat
//   isArr branch  -> number[] -> es.array.at
//   isStr-ts-cast -> string  -> es.string.pad-start
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