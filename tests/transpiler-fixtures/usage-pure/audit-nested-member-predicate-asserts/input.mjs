// nested method-form `asserts x is T` predicate: narrows after the call returns normally
// (not just inside an `if`-truthy branch). the predicate-guard resolution threads the asserts
// flag through the member-call-chain walk identically to the `x is T` form
declare const obj: {
  util: {
    assertStr(x: unknown): asserts x is string;
  };
};

function take(input: unknown) {
  obj.util.assertStr(input);
  return input.at(0);
}
