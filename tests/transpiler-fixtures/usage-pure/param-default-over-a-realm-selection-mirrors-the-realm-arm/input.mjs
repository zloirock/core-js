// Static and defaulted leaves mirror the realm arm of a selected parameter default.
// Plain nested instance bindings dispatch on the actual selected or supplied receiver;
// siblings retain their order and share the prototype read where needed.
const user = {};
export function a({ Array: { prototype: { at: x = 1 }, from: y } } = c ? globalThis : user) { return [x, y]; }
export function b({ Array: { of: x, name: y } } = c ? globalThis : user) { return [x, y]; }
export function d({ Object: { keys: x, [Symbol.iterator]: y } } = c ? globalThis : user) { return [x, y]; }
export function e({ Array: { prototype: { flat: x }, isArray: y } } = c ? globalThis : user) { return [x, y]; }
export function g({ self: { Map: { groupBy: x }, Symbol: { for: y } } } = c ? globalThis : user) { return [x, y]; }
export function h({ self: { Array: { fromAsync: x }, Promise: { any: y } } } = c ? globalThis : fb) { return [x, y]; }
