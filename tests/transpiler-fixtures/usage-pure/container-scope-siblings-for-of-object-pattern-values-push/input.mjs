// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
for (const item of [{ w: Object }]) {
  const { values: viaForOfHead } = item.w;
  out.push(viaForOfHead);
}
export { out };
