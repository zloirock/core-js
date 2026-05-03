import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// resolveMemberCallChain n-deep stress: `tools.guards.checkArray(x)` 3-level method
// predicate. helper walks props leaf-first then root-down through getTypeMembers;
// the leaf member's TSMethodSignature carries the type-predicate. Successful
// narrowing means `.at` polyfill emits inside the truthy branch only.
declare const tools: {
  guards: {
    checkArray(x: unknown): x is number[];
  };
};
function consume(x: unknown) {
  if (tools.guards.checkArray(x)) {
    _atMaybeArray(x).call(x, 0);
  }
}
consume([1]);