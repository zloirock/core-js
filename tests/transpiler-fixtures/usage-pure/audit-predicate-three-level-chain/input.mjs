// member-call-chain resolution n-deep stress: `tools.guards.checkArray(x)` 3-level method
// predicate. the resolver walks props leaf-first then root-down through the type members;
// the leaf member's TSMethodSignature carries the type-predicate. Successful
// narrowing means `.at` polyfill emits inside the truthy branch only.
declare const tools: {
  guards: {
    checkArray(x: unknown): x is number[];
  };
};
function consume(x: unknown) {
  if (tools.guards.checkArray(x)) {
    x.at(0);
  }
}
consume([1]);
