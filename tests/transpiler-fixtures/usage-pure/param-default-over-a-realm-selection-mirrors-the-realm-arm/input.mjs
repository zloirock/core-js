// A parameter default selecting the realm mirrors the realm arm level by level: a defaulted instance leaf
// off the prototype hop, an instance leaf beside a static, a `Symbol.iterator` slot, a descended prototype
// hop and a proxy hop over two constructors each take their slot in the arm the realm stands in.
const user = {};
export function a({ Array: { prototype: { at: x = 1 }, from: y } } = c ? globalThis : user) { return [x, y]; }
export function b({ Array: { of: x, name: y } } = c ? globalThis : user) { return [x, y]; }
export function d({ Object: { keys: x, [Symbol.iterator]: y } } = c ? globalThis : user) { return [x, y]; }
export function e({ Array: { prototype: { flat: x }, isArray: y } } = c ? globalThis : user) { return [x, y]; }
export function g({ self: { Map: { groupBy: x }, Symbol: { for: y } } } = c ? globalThis : user) { return [x, y]; }
export function h({ self: { Array: { fromAsync: x }, Promise: { any: y } } } = c ? globalThis : fb) { return [x, y]; }
