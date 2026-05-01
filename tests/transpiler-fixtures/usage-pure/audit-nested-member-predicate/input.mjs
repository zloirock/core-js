// nested-chain method-form predicate: `obj.util.isStr(x)`. resolvePredicateGuard walks
// the full dotted chain via resolveMemberCallChain (root binding -> intermediate property
// hops -> leaf method signature) so the TSTypePredicate `x is string` narrows `input`
// to string and `.at(0)` picks up the string-specific polyfill
declare const obj: {
  util: {
    isStr(x: unknown): x is string;
  };
};

function take(input: unknown) {
  if (obj.util.isStr(input)) {
    return input.at(0);
  }
}
