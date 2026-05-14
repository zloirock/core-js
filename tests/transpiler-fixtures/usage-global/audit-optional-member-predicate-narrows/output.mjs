import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
// User type-predicate called via optional-member chain (`obj?.isStr(input)`). babel
// encodes the callee as `OptionalMemberExpression`; the old `predicateCandidates` filter
// accepted only `MemberExpression`, dropping the narrow. unplugin's ChainExpression
// shape was handled - asymmetric behaviour between plugins. fix peels `ChainExpression`
// and adds `OptionalMemberExpression` to both `predicateCandidates` and
// `resolveMemberCallChain`'s walk. distinct methods per branch (.repeat vs .at) pin
// emission: string branch -> es.string.repeat, array branch -> es.array.at; without the
// fix both branches kept the input union and over-emitted the cross-type polyfills
interface Predicates {
  isStr(x: unknown): x is string;
  isArr(x: unknown): x is number[];
}
function caller(obj: Predicates, input: string | number[]) {
  if (obj?.isStr(input)) {
    input.repeat(2);
  }
  if (obj?.isArr(input)) {
    input.at(-1);
  }
}
caller(undefined as any, undefined as any);