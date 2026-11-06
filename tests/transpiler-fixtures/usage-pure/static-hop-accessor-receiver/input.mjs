// Accessor-backed member reads inside literal slots execute once in source order.
// Their nested static reads remain native across wrapper, alias and sibling hosts.
const log = [];
const { w: { from: one } } = { w: ({ get w() { log.push('a'); return Array; } }).w };
const { a: { b: { from: two } } } = { a: { b: ({ get w() { log.push('b'); return Array; } }).w } };
const [{ w: { from: viaWrapper } }] = [{ w: ({ get w() { log.push('c'); return Array; } }).w }];
const held = { w: ({ get w() { log.push('d'); return Array; } }).w };
const { w: { from: viaAlias } } = held;
const { w: { from: beside }, z } = { w: ({ get w() { log.push('e'); return Array; } }).w, z: 7 };
let assigned;
({ w: { from: assigned } } = { w: ({ get w() { log.push('f'); return Array; } }).w });
export { one, two, viaWrapper, viaAlias, beside, z, assigned, log };
