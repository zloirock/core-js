// declaration merging: `function fn` + `namespace fn { function inner }`. The
// outer `fn` is a runtime binding; `fn.inner` is a namespace member. typeof
// resolution needs to walk INTO the namespace through walkScopesForDecl with
// isFunctionOrClassDeclaration leaf-match. constantBindingPath returns the fn,
// but member-value lookup falls through; namespace branch should fire and
// resolve fn.inner to its declared return type.
declare function fn(): string;
declare namespace fn {
  function inner(): number[];
}
const r: ReturnType<typeof fn.inner> = [1, 2];
r.at(0);
