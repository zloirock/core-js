// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const order = [];
const eff = tag => (order.push(tag), tag);
const { [(eff('static'), 'Array')]: { from: viaStatic } } = globalThis;
const { [(eff('nav'), 'Array')]: { prototype: { values: viaNav } } } = globalThis;
const { [(eff('literal'), 'w')]: { of: viaLiteral } } = { w: Array };
const { [(eff('alias'), 'w')]: { at: viaAliasSlot } } = { w: src };
const { [(eff('memo'), 'w')]: { includes: viaLiteralSlot } } = { w: [1] };
const { [(eff('sibling'), 'Object')]: { entries: viaSibling }, z } = globalThis;
const { [(eff('pair'), 'Object')]: { keys: viaPairA, values: viaPairB } } = globalThis;
const { [(eff('rest'), 'Object')]: { fromEntries: viaRest }, ...rest } = globalThis;
let viaAssign;
({ [(eff('assign'), 'Object')]: { groupBy: viaAssign } } = globalThis);
function viaParam({ [(eff('param'), 'Object')]: { hasOwn: h } } = globalThis) { return h; }
const { [(eff('proxy'), 'self')]: { Math: { trunc: viaProxyHop } } } = globalThis;
const { a: { [(eff('deep'), 'Math')]: { sign: viaDeep } } } = { a: globalThis };
const { [(eff('default'), 'Object')]: { assign: viaDefault = null } } = globalThis;
const { [(eff('symbol'), 'Array')]: { [Symbol.iterator]: viaSymbol } } = globalThis;
export { order, viaStatic, viaNav, viaLiteral, viaAliasSlot, viaLiteralSlot, viaSibling, z, viaPairA, viaPairB, viaRest, rest, viaAssign, viaParam, viaProxyHop, viaDeep, viaDefault, viaSymbol };

const { [(eff('call'), 'w')]: { at: viaEffectfulSlot } } = { w: make() };
export { viaEffectfulSlot };
