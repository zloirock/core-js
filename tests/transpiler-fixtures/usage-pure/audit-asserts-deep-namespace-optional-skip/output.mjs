import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// deep-namespace optional segment in middle of callee chain: `obj.api.deep?.assert(x)`.
// optional sits BEFORE the leaf method, so the whole call may be skipped when `obj.api.deep`
// is nullish. hasOptionalChainInCall walks `.callee` for CallExpression and `.object` for
// MemberExpression; the inner OptionalMemberExpression (babel) / ChainExpression (oxc) must
// be detected even when wrapped under N-1 non-optional MemberExpression links above it.
// post-statement `.at(0)` / `.findLast(p => p)` must fall back to generic instance polyfills
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