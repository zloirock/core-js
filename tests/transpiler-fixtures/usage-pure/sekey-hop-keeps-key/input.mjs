// a HOP whose key carries an effect keeps its level the way a rest sibling does: the hop retires to
// a sentinel, so the key runs exactly once where the source wrote it, and the claims below extract
// off the slot the folded key names - the flat effectful key's own shape, one level up. one static
// per row, so a row's extraction is attributable to its own host
const order = [];
const eff = tag => (order.push(tag), tag);
const { [(eff('static'), 'Array')]: { from: viaStatic } } = globalThis;
const { [(eff('nav'), 'Array')]: { prototype: { values: viaNav } } } = globalThis;
const { [(eff('literal'), 'w')]: { of: viaLiteral } } = { w: Array };
const { [(eff('alias'), 'w')]: { at: viaAliasSlot } } = { w: src };
// an instance leaf that reads its SLOT keeps its own sentinel inside the hop (the memo channel's
// shape); one that reads a built-in surface lets the hop retire whole
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

// NEGATIVE: an effectful slot beside an effectful hop key has two effects to order and no memo
// that keeps the level - the pattern stays native on both legs
const { [(eff('call'), 'w')]: { at: viaEffectfulSlot } } = { w: make() };
export { viaEffectfulSlot };
