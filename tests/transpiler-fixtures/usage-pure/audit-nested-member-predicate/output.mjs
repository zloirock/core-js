import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// nested-chain method-form predicate: `obj.util.isStr(x)`. predicate-guard resolution must
// walk the full dotted chain (root binding -> intermediate property hops -> leaf method
// signature) so the TSTypePredicate `x is string` narrows `input` to string and `.at(0)`
// picks up the string-specific polyfill
declare const obj: {
  util: {
    isStr(x: unknown): x is string;
  };
};
function take(input: unknown) {
  if (obj.util.isStr(input)) {
    return _atMaybeString(input).call(input, 0);
  }
}