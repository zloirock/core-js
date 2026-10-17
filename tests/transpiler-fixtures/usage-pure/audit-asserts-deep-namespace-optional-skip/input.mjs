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
  input.at(0);
  return input.padStart(2);
}
