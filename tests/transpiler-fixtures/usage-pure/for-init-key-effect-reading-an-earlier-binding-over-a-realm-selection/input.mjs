// A for-init destructuring a realm selection binds a constructor that a later computed key's effect reads:
// babel binds it ahead of the key, while unplugin runs the key effects ahead of the bindings, so there the
// effect meets the binding uninitialized (sidecar).
for (const { Map: M, [(use(M), "Set")]: S } = flag ? globalThis : self; ;) break;
