function eff() { return null; }
// direct-root non-pure leaf control: seq prefix stays, root substitutes, leaf reads native
function directNonPure({ hasOwn, extra } = (eff(), globalThis.self.Object) || null) { return [hasOwn, extra]; }
directNonPure();
