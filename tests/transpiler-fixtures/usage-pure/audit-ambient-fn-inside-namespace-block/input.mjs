// ambient-function path lookup: ambient function declared inside a namespace block.
// Used through the ReturnType<typeof NS.makeArr> path, which traverses the module-decl
// segments to resolve the namespaced function.
declare namespace NS {
  function makeArr(): number[];
}
type R = ReturnType<typeof NS.makeArr>;
declare const r: R;
r.at(0);
