// Optional static and instance claims keep the first live realm probe and stored receiver.
// Repeated window hops, constructor guards and parentheses retain their distinct short-circuit boundaries.
const log = [];
const value = globalThis.window?.self?.Object[(log.push('key'), 'values')]({ a: 5 }).at(0);
const claimed = globalThis.window?.Map.prototype.has.call(new Map([[1, 3]]), 1);
const sealed = (globalThis.window?.Array).prototype.at.call([4], 0);
let held;
const repeatedStatic = (held = globalThis.window)?.window?.self.Array.from([7]).at(0);
const repeatedPrototype = (held = globalThis.window)?.window?.self.Map.prototype.has.call(new Map(), 1);
const guardedPrototype = globalThis.window?.Map?.prototype.has.call(new Map(), 1);
const heldPrototype = (held = globalThis.window)?.Map?.prototype.has.call(new Map(), 1);
