// A container declared in one LEXICAL scope and a same-named container written in a sibling scope are two bindings, and the census
// keys its records by the declaring scope: the write taints its own binding only, so the other's slot still binds the static - for
// a loop head (for-of, for-in, a for-init declarator), a block, a switch case and a catch parameter shadowing the name alike.
const out = [];
{
  var shared = { w: Object };
  const { getOwnPropertyNames: viaVarWrittenElsewhere } = shared.w;
  out.push(viaVarWrittenElsewhere);
}
{
  var shared = { w: Array };
  shared.w = Map;
}
export { out };
