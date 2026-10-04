// Optional chained dispatches in a parameter-property default keep all receiver and
// method memos in that default's activation. The parameter cannot see body vars, and
// separate constructions must never share an enclosing memo slot.
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
