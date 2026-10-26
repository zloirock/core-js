// An unsupported member tail keeps its receiver and independently visited children.
// Known nested globals, statics and instance calls still request their own entries.
export const ctor = globalThis.Map.unrelatedField;
export const staticLength = Array.from([1, 2]).length;
export const instanceLength = [1, [2]].flat().length;
export const optional = box?.unrelatedField?.(new Set());
export const keyed = box[(effect(), Symbol.iterator)];
export const callResult = callable.call(receiver, Object.entries({ x: 1 }));
export const bindResult = callable.bind(receiver, String.fromCodePoint(65));
const C = Promise;
export const prototype = C.prototype;
export const constructor = C.prototype.constructor;
