// A DEFAULTED instance leaf under a deeper hop, beside a sibling leaf, off a realm init that runs
// effects first: the whole init memoizes and the leaf dispatches off the memo through the canonical
// default guard - the route its undefaulted twin takes, which once admitted the bare identifier
// alone and left the defaulted leaf native on the unplugin leg. The anonymous default keeps its name.
let eff = 0;
const { Array: { prototype: { flat: f1 = () => 1 }, of: o1 } } = (eff++, globalThis);
const { Array: { prototype: { flat: f2 = () => 1, at: a2 } } } = (eff++, globalThis);
const { Array: { prototype: { flat: f3 = () => 1 }, of: o3 } } = (eff++, self);
const { Array: { prototype: { flat: f4 = () => 1, at: a4 = () => 2 }, of: o4 } } = (eff++, globalThis);
let f5, o5;
({ Array: { prototype: { flat: f5 = () => 1 }, of: o5 } } = (eff++, globalThis));
// ... and off a USER receiver of unknown type, where the default is live and its name observable
function pick(user) {
  const { codes: { findIndex: m6 = () => 1 }, other: o6 } = (eff++, user);
  return [m6, o6];
}
export { eff, f1, o1, f2, a2, f3, o3, f4, a4, o4, f5, o5, pick };
