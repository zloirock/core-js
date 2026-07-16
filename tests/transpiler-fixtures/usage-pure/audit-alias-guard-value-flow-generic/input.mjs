// A conditionally-executed aliasing write assigns on one path only: the value-flow return
// resolver must refuse the (constructor, method) pair exactly like the body-extract route,
// keeping the call-result dispatch GENERIC on both emitters (a pristine-tree walk used to
// narrow it array-typed while the other emitter's post-rewrite scope stayed generic).
// guarded assignment-form write - the call result dispatches generic
let make;
if (cond) ({ from: make } = Array);
export const r = make([1]);
export const x = r.at(0);
// a guarded hoisted-var declarator still EXTRACTS (polyfill always wins on the write
// itself), so the call result narrows through the polyfilled-entry route - identical on
// both emitters, unlike the refused user-flow trust above
if (cond) {
  var { keys } = Object;
}
export const t = keys(obj);
export const y = t.map(v => v);
// control: an UNCONDITIONAL alias keeps the typed narrow
const { of } = Array;
export const s = of(1, 2);
export const z = s.includes(1);
