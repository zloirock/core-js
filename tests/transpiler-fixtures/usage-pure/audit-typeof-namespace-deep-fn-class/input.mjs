// findNamespacedFunctionPath: typeof NS.Inner.fn / typeof NS.Inner.Cls
// resolved through walkScopesForDecl with isFunctionOrClassDeclaration leafMatch
declare namespace NS {
  namespace Inner {
    function makeArr(): number[];
    class Holder {
      static items: string[];
    }
  }
}
type R = ReturnType<typeof NS.Inner.makeArr>;
declare const r: R;
r.at(0);
type H = typeof NS.Inner.Holder;
declare const h: InstanceType<H>;
h.items.findLast(x => true);
