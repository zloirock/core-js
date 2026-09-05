// a container declared in one LEXICAL scope and a same-named container written in a sibling scope
// are two bindings, and the census keys its records by the declaring scope: the write taints its own
// binding only, so the other's slot still binds the static - for a loop head (for-of, for-in, a
// for-init declarator), a block, a switch case and a catch parameter shadowing the name alike. a `var` is one binding
// across every block of its function, so a write through it in a sibling block reaches every read
const out = [];
for (const item of [{ w: Object }]) {
  const { values: viaForOfHead } = item.w;
  out.push(viaForOfHead);
}
for (const item of [{ w: Array }]) item.w = Map;
for (const key in { w: Object }) {
  const item = { w: Object };
  const { entries: viaForInBody } = item.w;
  out.push(viaForInBody, key);
}
for (const key in { w: Array }) {
  const item = { w: Array };
  item.w = Map;
  out.push(key);
}
for (let i = 0, item = { w: Object }; i < 1; i++) {
  const { is: viaForInit } = item.w;
  out.push(viaForInit);
}
for (let i = 0, item = { w: Array }; i < 1; i++) item.w = Map;
{
  const item = { w: Object };
  const { keys: viaBlock } = item.w;
  out.push(viaBlock);
}
{
  const item = { w: Array };
  item.w = Map;
}
switch (out.length) {
  default: {
    const item = { w: Object };
    const { assign: viaSwitchCase } = item.w;
    out.push(viaSwitchCase);
  }
}
switch (out.length) {
  default: {
    const item = { w: Array };
    item.w = Map;
  }
}
const holder = { w: Object };
try {
  throw { w: Array };
} catch (holder) {
  holder.w = Map;
}
const { fromEntries: viaCatchShadow } = holder.w;
out.push(viaCatchShadow);
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
