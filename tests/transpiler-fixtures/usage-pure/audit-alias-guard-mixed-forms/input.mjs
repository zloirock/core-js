// a binding written through BOTH a conditional hoisted `var` destructure and an assignment-form
// destructure: the registrations merge across every declarator key of the slot (no positional
// name-view ambiguity), and the guard hint is deterministically the LAST source write's ctor -
// the earlier branch falls to the guard's raw read (value-exact under any flow). a
// SIDE-EFFECTING computed key stays raw entirely: the guard's consequent replaces the whole
// member and would skip the key effect the native evaluation always runs
function fwd(c, d) {
  if (c) { var { Map: M } = globalThis; }
  if (d) ({ Promise: M } = globalThis);
  try { return typeof M.try; } catch (e) { return 'T'; }
}
export const r1 = [fwd(false, true), fwd(false, false)];
function rev(c, d) {
  if (c) ({ Promise: P } = globalThis);
  if (d) { var { Iterator: P } = globalThis; }
  try { return typeof P.range; } catch (e) { return 'T'; }
}
export const r2 = [rev(false, true), rev(true, false)];
let K;
let c1 = 0;
const cond = () => true;
if (cond()) ({ Map: K } = globalThis);
export const r3 = [typeof K[(c1++, 'groupBy')], c1];
