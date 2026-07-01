// 3-level method-form predicate: `ns.utils.guards.isArr(x)`. each intermediate hop
// (utils, guards) steps into the carried annotation via type-member lookup; the leaf's
// TSTypePredicate `x is unknown[]` narrows the receiver in the truthy branch
declare const ns: {
  utils: {
    guards: {
      isArr(x: unknown): x is unknown[];
    };
  };
};

function take(input: unknown) {
  if (ns.utils.guards.isArr(input)) {
    return input.at(0);
  }
}
