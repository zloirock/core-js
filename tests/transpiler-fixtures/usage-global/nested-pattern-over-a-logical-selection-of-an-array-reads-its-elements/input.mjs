// a nested pattern reading an element of an array a `&&` / `||` selects - in place, through a holder, as a
// parameter default, in an assignment - names no constructor for the selection: each element's method loads
// as for an array read anywhere, and the walk that only asks for one agreed name collects no candidates
export const { items: [{ map }] } = { items: ok && [list] };
const cfg = { items: ok && [list] };
export const { items: [{ filter }] } = cfg;
export const { w: [{ at }] } = { w: a || [Set] };
export function f({ items: [{ some }] } = { items: ok && [list] }) {
  return some;
}
let every;
({ items: [{ every }] } = { items: ok && [list] });
