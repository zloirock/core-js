// a TS parameter-property default anchors the use on the FUNCTION (no AssignmentPattern to
// hoist through), so every memo `var _refN` must land in the ENCLOSING scope - the param
// scope cannot see constructor-body vars. the memos here come from CLONED / SYNTHESIZED
// nodes (the optional method node, the combined-chain spliced receiver), whose missing
// ranges once failed the param-escape check and stranded `var _refN` in the body
// (ReferenceError at `new D()`)
class D {
  constructor(public y = arr.flat?.().at?.(0)) {}
}
export const d = new D();
class C {
  constructor(private x = state.list.at?.(0)) {}
}
export const c = new C();
// the loop-header twin of the same escape check, with a non-reusable receiver
for (let i = cfg.items.at?.(0); i < limit; i++) use(i);
