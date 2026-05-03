// findAmbientFunctionPath / walkAmbientDeclarationPath: ambient function
// declared inside a namespace block. Use through ReturnType<typeof NS.makeArr>
// path which uses findNamespacedFunctionPath to traverse module-decl segments
declare namespace NS {
  function makeArr(): number[];
}
type R = ReturnType<typeof NS.makeArr>;
declare const r: R;
r.at(0);
