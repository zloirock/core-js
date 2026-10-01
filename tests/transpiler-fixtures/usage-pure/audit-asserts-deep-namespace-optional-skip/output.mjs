import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// deep-namespace optional segment mid callee chain: `obj.api.deep?.assert(x)`. the optional
// sits BEFORE the leaf method, so the whole call may be skipped when `obj.api.deep` is
// nullish. the inner OptionalMemberExpression (babel) / ChainExpression (oxc) must be detected
// even under N-1 non-optional MemberExpression links, so `.at(0)` / `.padStart(2)` fall back
// to generic instance polyfills
declare const obj: {
  api: {
    deep?: {
      assertStr(x: unknown): asserts x is string;
    };
  };
};
function take(input: unknown) {
  obj.api.deep?.assertStr(input);
  _at(input).call(input, 0);
  return _padStartMaybeString(input).call(input, 2);
}