// legacy TS `module N {}` spelling - @babel/parser@7 accepts as a namespace synonym,
// @babel/parser@8 rejects (reserves `module` for external-module declarations with a
// string name). modern equivalent lives in at-call-ts-namespace-body
module N {
  export const x = [1, 2, 3].at(0);
}
